var crypto = require('crypto'),
	moment = require('moment');

var Schema = function(option) {
		this.namespace = option.namespace;
		this.name = option.name;
		this.index = [];
		this.unqiue = [];
		this.intProperties = [];
		this.dateProperties = [];

		this.properties = {};
		var properties = option.properties || {};
		for (var name in properties) {
			this.property(name, properties[name]);
		}
	};

module.exports = Schema;

/**
 * 定义属性
 */
Schema.prototype.property = function(name, metadata) {
	metadata = metadata || {};

	if (metadata.identifier) {
		this.identifier = name;
	}
	if (metadata.unique) {
		this.unique.push(name);
	}
	if (metadata.index) {
		this.index.push(name);
	}


	if (metadata.type == 'int') {
		this.intProperties.push(name);
	} else if (metadata.type == 'date') {
		this.dateProperties.push(name);
	} else {
		metadata = 'string';
	}

	this.properties[name] = metadata;
};

/**
 * 取hash值
 */
Schema.prototype.hash = function(key) {
	if (key != null) {
		return crypto.createHash('sha1').update(key + "").digest('hex');
	} else {
		return 'null';
	}
};

Schema.prototype.serialize = function(records) {
	var isArray = Array.isArray(records);
	!isArray && (records = [records]);

	records = records.map(function(record) {
		this.intProperties.forEach(function(prop) {
			record[prop] != null && (record[prop] = record[prop] + '');
		});

		this.dateProperties.forEach(function(prop) {
			record[prop] != null && (record[prop] = moment(record[prop]).format('YYYYMMDDHHmmss'));
		});
		return record;
	}, this);

	return isArray ? records : records[0];
};

Schema.prototype.deserialize = function(records) {
	var isArray = Array.isArray(records);
	!isArray && (records = [records]);

	records = records.map(function(record) {
		if (record != null) {
			this.intProperties.forEach(function(prop) {
				record[prop] != null && (record[prop] = +record[prop]);
			});

			this.dateProperties.forEach(function(prop) {
				record[prop] != null && (record[prop] = moment(record[prop], 'YYYYMMDDHHmmss'));
			});
		}
		return record;
	}, this);

	return isArray ? records : records[0];
};