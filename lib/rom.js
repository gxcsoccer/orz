var redis = require('redis'),
	slice = Array.prototype.slice,
	Records = require('./Records');

/**
 * rom对象，用于管理schema
 */
var rom = function(option) {
		if (!(this instanceof rom)) {
			return new rom(option);
		}

		this.records = {};

		this.redis = option.redis || redis.createClient(option.port || 6379, option.host || '127.0.0.1');
		option.password && this.redis.auth(option.password);
		option.database && this.redis.select(option.database);
	};

/**
 * 获取Schema，如果不存在根据输入构造一个
 */
rom.prototype.get = function(schema) {
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

	return this.records[schema.name] || (this.records[schema.name] = new Records(redis, schema));
};

/**
 * 退出
 */
rom.prototype.quit = function() {

};