
/*
 * GET home page.
 */
var YQL = require("yql");
var iconv = require("iconv-lite");
var async = require("async");
var csv = require("csv");

var connection = require('../model/db.js').connection;



var addItemTransaction = 
	"BEGIN; " +
	"INSERT INTO uygks_content (title, catid, created_by, state, access) " +
	"   VALUES (?, 100, 48, 1, 1); " +
	"SELECT LAST_INSERT_ID() into @pk; " +
	"INSERT INTO uygks_cck_core (cck, pk, storage_location, author_id, parent_id) " +
	"   VALUES ('wedding_catalog', @pk, 'joomla_article', 48, ?); " +
	"SELECT LAST_INSERT_ID() into @id; " +
	"UPDATE uygks_content  " +
	"   SET introtext = concat('::cck::', @id, '::/cck::') " +
	"   WHERE id = @pk; " +
	"INSERT INTO uygks_cck_store_form_wedding_catalog " +
	"   (id, ct_title, ct_state, wcat_e_mail, wc_city, wc_author_id) " +
	"   VALUES (@pk, ?, 'KIE', ?, 'kiev', 48); " +
	"INSERT INTO uygks_cck_store_item_content " +
	"   (id, cck, telephone, company_site, description, company_logo) " +
	"   VALUES (@pk, 'wedding_catalog', ?, ?, ?, ?); " +
	"COMMIT;";

exports.index = function(req, res){
	var count = 0;
	var processed = 0;
	var items = [];

	var csvStream = csv().to.stream(res, {
		'quoted': true,
		'escape': '\\',
		columns: ['title', 'info', 'image', 'text']
	});
	res.charset = 'utf8';
	// res.writeHead(200, {'Content-Type': 'application/json'});
	// res.type('csv');
	// res.setHeader('Content-Type', 'text/csv');
	// res.setHeader('Content-Disposition', 'attachment; filename=dump.csv');

	function decode(data){
		var buffer = new Buffer(JSON.stringify(data));
		var str = iconv.decode(buffer, 'utf8');
		return JSON.parse(str);
	};


	// new YQL.exec('select * from data.html.cssselect where url="http://wedding.ua/invitation/kiev/guestbook" and css=".box_news, .box_news2"',
	new YQL.exec('select * from data.html.cssselect where url="http://wedding.ua/invitation/kiev" and css=".box_news, .box_news2"',
		function(resp) {
			// console.log(chardet.detect(resp));
			if (resp.query.results == null)
				throw "null items";
			var json = decode(resp.query.results.results.div);
			// console.log(json.length);
			// res.send(json);
			async.eachLimit(json, 15, parseCats, processData);
		}
	);

	function parseCats(item, callback){
		var url = "http://wedding.ua" + item.div.div[0].a.href;
		var cat = item.div.div[1].h4.a.content;
		new YQL.exec('SELECT * FROM data.html.cssselect WHERE (url = @url) and css=".box_news, .box_news2"',
			function(resp) {
				if (resp.query.results == null){
					// callback("null items");
					callback();
					return;
				} else {
					var json = decode(resp.query.results.results.div);
					// console.log(resp.query.results);
					// console.log([url, json.length]);
					// res.send(json);
					async.eachLimit(json, 2, 
						function(item, callback){
							parseItem(cat, item, callback);
						}, 
						function(err){
							callback(err);
						}
					);
				}
			},
			{
				"url": url
			}
		);
	};

	function parseItem(cat, item, callback){
		var url = "http://wedding.ua" + item.div.div.pop().a.href;
		count++;
		// console.log(url);
		new YQL.exec('SELECT * FROM data.html.cssselect WHERE (url = @url) and css=".title_agencyInfo"',
			function(resp) {
				if (resp.query && resp.query.results == null){
					// callback(url + " null item");
					callback();
					return;
				} else {
					var json = decode(resp.query.results.results.div.div.div);
					var obj = {
						title: "",
						email: "",
						site: "",
						image: "",
						text: ""
					};
					obj.category = cat;
					json.forEach(function(item) {
						// console.log(item.class);
						switch(item.class){
							case "agencyBox_text":
								obj.title = item.span.strong;
								// obj.info = item.p.reduce(function(prev, cur, key, array) {
								// 	var str = cur.span;
								// 	if (prev.span)
								// 		prev = prev.span.strong + prev.span.content + '<br>';
								// 	if (str.a){
								// 		return prev + str.strong + ' ' + str.a.content;
								// 	} else {
								// 		return prev + str.strong + str.content + '<br>';
								// 	};
								// });
								// obj.phone = "";
								item.p.forEach(function(node) {
									var tag = node.span;
									switch(tag.strong){
										case "Тел.:":
											obj.phone = (obj.phone ? obj.phone + ", " : "") + tag.content.trim(); 
										break;
										case "E-mail:":
											obj.email = tag.content.trim(); 
										break;
										case "Сайт:":
											obj.site = tag.a.href; 
										break;
									};
								});
								// obj.html = item.p;
								break;
							case "picAgency":
								obj.image = item.img.src;
								break;
							case "textAgency_title":
								obj.text = cat + '\n' + parseNode(item);
								// obj.text = item;
								break;
						};
					});
					if (!obj.phone)
						obj.phone = "";
					addItem(obj, callback);
					// csvStream.write(obj);
					// res.write(JSON.stringify(obj));


				}
			},
			{
				"url": url
			}
		);
	};

	function parseNode(tag) {
		var node = tag.p || tag.div || tag.span || tag.ul;

		// console.log(tag);

		if (tag instanceof Array || typeof tag == 'string' || tag.content)
			node = tag;

		if (!node)
			return "";

		if (node.content)
			return node.content;

		if (node instanceof Array)
			return reduceNode(node);

		var children = node.p || node.div || node.span || node.ul || node.li;

		if (children)
			return parseNode(children);

		if (node instanceof Object)
			return "";
		else
			return node;
	};

	function reduceNode (node) {
		return node.reduce(function(prev, cur, k) {
			// console.log([k, prev, cur]);
			if (k == 1)
				prev = parseNode(prev);
			return prev + '\n' + parseNode(cur);
		});
	};

	function processData(err){
		if (err)
			throw err;
		// console.log(count);
		// res.write('found ' + count + ' items, \n processed ' + processed + ' items');
		console.log('found ' + count + ' items, \n processed ' + processed + ' items');
		csvStream.end();
		// res.send(items);
		// res.end();
	};

	function ConvertToCSV(objArray) {
	    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
	    var str = '';

	    for (var i = 0; i < array.length; i++) {
	        var line = '';
	        for (var index in array[i]) {
	            if (line != '') line += ','

	            line += array[i][index];
	        }

	        str += line + '\r\n';
	    }

	    return str;
	};

    function addItem(item, callback){
      var data = [
        item.title,
        100,
        item.title,
        item.email,
        item.phone,
        item.site,
        item.text,
        item.image
      ];
      connection.query(addItemTransaction, data, function select(error, result, fields){
        if (error)
          callback(error);

      	// items.push(item);
		csvStream.write(item);
        processed++;
		callback();
      });
    };
};