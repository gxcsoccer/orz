var crypto = require('crypto');

var Schema = function(option) {
		this.namespace = option.namespace;
		this.name = option.name;
		this.index = [];
		this.unqiue = [];

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