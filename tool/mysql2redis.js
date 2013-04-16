var mysql = require('mysql'),
	fs = require('fs'),
	path = require('path'),
	connection = mysql.createConnection(require("./config.json"));

var re_int = /^.*int|float|double.*$/i,
	re_char = /^.*char.*$/i,
	re_date = /^.*date.*$/i;

exports.getSchema = function(namespace, name) {
	connection.query('DESCRIBE ' + namespace + '_' + name, function(err, rows) {
		console.log(rows);
		var schema = {
			name: name,
			properties: {}
		};
		rows.forEach(function(field) {
			schema.properties[field.Field] = {};
			if (field.Key == 'PRI') {
				schema.properties[field.Field].identifier = true;
			}
			schema.properties[field.Field].type = 'string';
			if (re_int.test(field.Type)) {
				schema.properties[field.Field].type = 'int';
			} else if (re_date.test(field.Type)) {
				schema.properties[field.Field].type = 'date';
			}
		});

		fs.writeFileSync(path.join('../schema', name + '.json'), JSON.stringify(schema, null, 4));
	});
};