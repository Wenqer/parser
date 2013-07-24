var mysql = require('mysql');

var connection = mysql.createConnection({
	host: 'lab01pri.mysql.ukraine.com.ua',
	user: 'lab01pri_sweet',
	database: 'lab01pri_sweet',
	password: 'h4hrc7zj',
	multipleStatements: true
});

connection.connect();

exports.connection = connection;