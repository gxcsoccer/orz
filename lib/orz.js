var redis = require('redis'),
	slice = Array.prototype.slice,
	Records = require('./Records');

/**
 * orz对象，用于管理schema
 */
var orz = function(option) {
		if (!(this instanceof orz)) {
			return new orz(option);
		}

		option = option || {};
		this.records = {};
		this.namespace = option.namespace || 'orz';
		this.redis = option.redis || redis.createClient(option.port || 6379, option.host || '127.0.0.1');
		option.password && this.redis.auth(option.password);
		option.database && this.redis.select(option.database);
	};

/**
 * 获取Schema，如果不存在根据输入构造一个
 */
orz.prototype.get = function(schema) {
	schema = schema || {};
	var args = slice.call(arguments, 0);

	if (args.length == 2) {
		schema = args[1];
		if (typeof args[0] === 'string') {
			schema.name = args[0];
		}
	} else if (typeof schema === 'string') {
		schema = {
			name: schema
		};
	}
	schema.namespace = this.namespace;
	return this.records[schema.name] || (this.records[schema.name] = new Records(this.redis, schema));
};

/**
 * 退出
 */
orz.prototype.quit = function(callback) {
	this.redis.quit(function(err, status) {
		if (!callback) {
			return;
		}
		if (err) {
			return callback(err);
		}
		if (callback) {
			return callback(null, status);
		}
	});
};

module.exports = orz;