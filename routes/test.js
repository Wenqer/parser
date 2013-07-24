
/*
 * GET home page.
 */
var YQL = require("yql");
var iconv = require("iconv-lite");
var async = require("async");

var connection = require('../model/db.js').connection;


exports.index = function(req, res){
	var item = {
      "class": "textAgency_title",
      "div": [
        {
          "style": "text-align: justify;",
          "p": "Имидж студия «Charodeyki» - это объединение дизайнеров, стилистов, технологов, художников, декораторов и флористов цель которого создание дизайна в свете последних мировых тенденций, новейших разработок и технологий."
        },
        {
          "style": "text-align: justify;",
          "br": null
        },
        {
          "style": "text-align: justify;",
          "p": "Услуги в сфере дизайна, стиля, флористики."
        },
        {
          "style": "text-align: justify;",
          "p": "Мы предоставляем услуги в сфере дизайна, стиля, флористики:"
        },
        {
          "style": "text-align: justify;",
          "ul": {
            "li": [
              {
                "span": {
                  "style": "font-size: 9pt;",
                  "content": "стилистическая концепции мероприятия;"
                }
              },
              {
                "span": {
                  "style": "font-size: 9pt;",
                  "content": "дизайн декораций, баннеров;"
                }
              },
              {
                "span": {
                  "style": "font-size: 9pt;",
                  "content": "репортажная и имиджевая фотосессия (портфолио);"
                }
              },
              {
                "span": {
                  "style": "font-size: 9pt;",
                  "content": "услуги флориста (поздравительные букеты, подарочные корзины, цветочные аксессуары, оформление мероприятий)."
                }
              },
              {
                "span": {
                  "style": "font-size: 9pt;",
                  "content": "эксклюзивный дизайн свадьбы (свадебная стилистика, флористика и свадебная полиграфия"
                }
              }
            ]
          }
        },
        {
          "style": "text-align: justify;",
          "span": {
            "style": "font-size: 9pt;",
            "content": "А так же: "
          }
        },
        {
          "style": "text-align: justify;",
          "ul": {
            "li": [
              {
                "span": {
                  "style": "font-size: 9pt;",
                  "content": "консультация стилиста;"
                }
              },
              {
                "span": {
                  "style": "font-size: 9pt;",
                  "content": "формирование гардероба;"
                }
              },
              {
                "span": {
                  "style": "font-size: 9pt;",
                  "content": "создание индивидуального образа;"
                }
              },
              {
                "span": {
                  "style": "font-size: 9pt;",
                  "content": "индивидуальный пошив;"
                }
              },
              {
                "span": {
                  "style": "font-size: 9pt;",
                  "content": "пошив корпоративной одежды;"
                }
              },
              {
                "span": {
                  "style": "font-size: 9pt;",
                  "content": "stylebook - руководство по соблюдению созданного имиджа."
                }
              }
            ]
          }
        }
      ]
    };

    var item2 = {
      "class": "textAgency_title",
      "div": [
        {
          "style": "text-align: justify;",
          "p": "Свадебные бокалы и шампанское Киев"
        },
        {
          "style": "text-align: justify;",
          "span": {
            "style": "font-size: 9pt;",
            "br": null
          }
        },
        {
          "style": "text-align: justify;",
          "span": {
            "style": "font-size: 9pt;",
            "content": "Свадебные бокалы, как и праздничное шампанское — это действительно настоящее превосходное украшение для торжественного стола. И с shop.wedding.ua они будут просто идеально изящными. Вы можете выбрать великолепные свадебные фужеры для молодоженов из огромного разнообразия вариантов. Для Вас представлены только самые различные бокалы на свадьбу — найдите для себя именно те, которые наилучшим образом подчеркнут всю красоту Вашей пары."
          }
        },
        {
          "style": "text-align: justify;",
          "span": {
            "style": "font-size: 9pt;",
            "br": null
          }
        },
        {
          "style": "text-align: justify;",
          "span": {
            "style": "font-size: 9pt;",
            "content": "Специалисты гарантируют Вам, что отыскать их будет очень легко! Вам предлагают очень большое разнообразие и стильных, и интересных аксессуаров для Вашей церемонии. а также и праздничного стола. Все они символизируют собой как мужчину, так и женщину, которые решили связать себя узами брака, а точнее, союз двух людей. Изящные и оригинальные фужеры для молодоженов показывают, какими хрупкими могут быть отношения сначала и какими достаточно крепкими их можно сделать уже впоследствии. Неслучайно их связывают ленточкой, таким образом, поступая в соответствии с традициями, пара желает себе только долгих лет счастливого брака."
          }
        }
      ]
    };

	function parseNode(tag) {
		var node = tag.p || tag.div || tag.span || tag.ul || tag.li;

		console.log(node);
		console.log('-------------');

		if (tag instanceof Array || typeof tag == 'string' || tag.content)
			node = tag;

		if (!node){
			console.log('fail parse');
			return "";
		}

		if (node.content)
			return node.content;

		if (node instanceof Array)
			return reduceNode(node);

		var children = node.p || node.div || node.span || node.ul || node.li;

		// console.log(children);
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

    // var node = parseNode(item2);
	// console.log(node);
	// res.send(node);
		// if (!item.div)
		// if (item.div && item.div.length){
		// 	console.log(item);
		// 	obj.text = item.div.reduce(function(prev, cur, key, array){
		// 		if (prev.p)
		// 			prev = prev.p;
		// 		if (cur.br)
		// 			return prev + "<br>";
		// 		else
		// 			return prev + cur.p;
		// 	});
		// } else {
		// }
			// obj.text = item;
		// } else if (item.div && item.div.div && item.div.div.length) {
		// 	// console.log(item.div.div);
		// 	obj.text = item.div.div.reduce(function(prev, cur, key, array){
		// 		if (prev.p)
		// 			prev = prev.p;
		// 		if (cur.br)
		// 			return prev + "<br>";
		// 		else
		// 			return prev + cur.p;
		// 	});
		// } else {
		// 	if (item.div && item.div.p){
		// 		obj.text = item.div.p;	
		// 	} else {
		// 		console.log(item);
		// 	};
		// };

    var item = {
      "category": "Фотоальбом",
      "image": "http://wedding.ua/img_user/product/prod_img_orig_56342.jpg",
      "title": "Shop.Wedding.ua",
      "phone": "(067) 843-22-88, (050) 718-22-88, (063) 826-22-88",
      "email": "shop@dempire.com.ua",
      "site": "http://www.shop.wedding.ua/fotoaksessuary",
      "text": "Фотоальбом\nCвадебные фотоальбомы Киев\n\nСвадебный фотоальбом – это чудесная возможность окунуться в мир приятных воспоминаний и снова испытать то прекрасное чувство невероятного восторга. Ваш фотоальбом навсегда сохранит память о самых романтических, светлых и счастливых моментах в вашей жизни. Все ваши эмоциональные переживания, праздничная суета, а также шумное веселье и торжественная часть официальной церемонии, словно маленькие кусочки большого пазла, собираются в целую картину, которая расскажет историю вашей искренней любви. А shop.wedding.ua предлагает вам большое количество различных и на любой вкус таких необходимых свадебных фотоаксессуаров."
    };

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
          throw error;
        res.send(result);
      });
    };

    addItem(item, null);
						
};