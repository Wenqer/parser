
/*
 * GET home page.
 */
var htmlparser = require("htmlparser2");
var request = require('request');
var stream = require('stream');
var util = require("util");

exports.index = function(req, res){
	var writestream = new stream.Stream();
	writestream.writable = true;
	writestream.write = function (data) {
		console.log(data);
	  return true; // true means 'yes i am ready for more data now'
	  // OR return false and emit('drain') when ready later
	};
	writestream.end = function (data) {
	  // no more writes after end
	  // emit "close" (optional)
	};

	//writestream.write({number: 1})
	// note: in node core data is always a buffer or string

	/**
	 * A simple upper-case stream converter.
	 */

	// var UpperCaseStream = function () {
	//   this.readable = true;
	//   this.writable = true;
	// };

	// util.inherits(UpperCaseStream, stream);

	/**
	 * Handle various params and upper-case string data.
	 *
	 * Signature can be in format of:
	 *  - string, [encoding]
	 *  - buffer
	 *
	 * Our example implementation hacks the data into a simpler
	 # (string) form -- real implementations would need more.
	 */
	// UpperCaseStream.prototype._transform = function (data) {
	//   // Here, we'll just shortcut to a string.
	//   data = data ? data.toString() : "";

	//   // Upper-case the string and emit data event with transformed data.
	//   this.emit("data", data);
	// };

	// /**
	//  * Stream write (override).
	//  */
	// UpperCaseStream.prototype.write = function () {
	//   this._transform.apply(this, arguments);
	// };

	// /**
	//  * Stream end (override).
	//  */
	// UpperCaseStream.prototype.end = function () {
	//   this._transform.apply(this, arguments);
	//   this.emit("end");
	// };

	// var upperCase = new UpperCaseStream();

	var dump = "";

	// var parser = new htmlparser.Parser({
	//     onopentag: function(name, attribs){
	//         if(name === "table"){
	//             console.log("Table! Hooray!");
	//         }
	//     },
	//     ontext: function(text){
	//         dump += text + "<br>";
	//     },
	//     onclosetag: function(tagname){
	//         if(tagname === "table"){
	//             console.log("That's it?!");
	//         }
	//     }
	// });
	var parseStream = new htmlparser.Stream();
	parseStream.on("error", function(err) {
		// if (name === "table")
		console.log(err);
	});

    var products = [];
    var news = null;
    var currentTag = null;
    var seeker = "box_news";

    parseStream.on('opentag', function (tag, attr) {
      if (attr.class !== seeker && !news) return;
      // if (attr.class === seeker) {
      //   news = tag;
      // }
      var node = {};
      node.name = tag;
      node.parent = currentTag;
      node.children = [];
      node.parent && node.parent.children.push(node);
      // console.log(node);
      currentTag = node;
    });

    parseStream.on('closetag', function (tag) {
    	// console.log(tag);
      if (tag === product) {
        products.push(product);
        currentTag = product = null;
        return;
      }
      if (currentTag && currentTag.parent) {
        var p = currentTag.parent;
        delete currentTag.parent;
        currentTag = p;
      }
    });

    parseStream.on('text', function (text) {
      if (currentTag){
      	// console.log(currentTag.children);
      	currentTag.children.push(text);
      }
    });

    parseStream.on('end', function() {
    	res.send(products);
    });

	// parseStream.readable = true;
	request("http://wedding.ua/invitation/kiev", function(err, resp, body) {
		// resp.on("start", function(){
		// 	console.log("ahoy!");
		// 	parser.end();
		// });
		// parser.write(body);
		// console.log(parser);
		// parser.end();
		// res.send(body);
	})
	.pipe(parseStream);
	// .pipe(writestream);
	// console.log(parseStream);
	// parser.write("Xyz <script type='text/javascript'>var foo = '<<bar>>';< /  script>");
  // res.render('index', { title: 'Express' });
};