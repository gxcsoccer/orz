var util = require('util'),
	_ = require('underscore'),
	Schema = require('./Schema'),
	slice = Array.prototype.slice;

function noop() {}

var Records = function(redis, option) {
		this.redis = redis;

		Schema.call(this, option);
	};

util.inherits(Records, Schema);

module.exports = Records;

/**
 * 构造一条或多条记录
 */
Records.prototype.create = function(records, option, callback) {
	var args = slice.call(arguments, 0),
		namespace = this.namespace,
		domain = this.name,
		identifier = this.identifier,
		redis = this.redis;

	if (args.length === 2 && typeof args[1] === 'function') {
		callback = option;
		option = {};
	}

	if (!Array.isArray(records)) {
		records = [records];
	}

	this.exists(_.pluck(records, identifier), function(err, ids) {
		var i = 0,
			len = ids.length,
			multi;
		if (err) {
			return callback(err);
		}
		for (; i < len; i++) {
			if (ids[i] != null) {
				return callback(new Error("Record " + ids[i] + " already exists"));
			}
		}

		multi = redis.multi();

		console.log(records);
		records.forEach(function(record) {
			// id加入set
			console.log(namespace + ":" + domain + ":" + identifier);
			multi.sadd(namespace + ":" + domain + ":" + identifier, record[identifier]);
			// 保存为hash
			console.log(namespace + "_" + domain + "_" + record[identifier]);
			multi.hmset(namespace + "_" + domain + "_" + record[identifier], record);
			// TODO: index & unique
		});

		multi.exec(callback);
	});
};

/**
 * 检查记录是否存在
 */
Records.prototype.exists = function(ids, callback) {
	var redis = this.redis,
		multi = redis.multi(),
		namespace = this.namespace,
		domain = this.name,
		identifier = this.identifier;

	!Array.isArray(ids) && (ids = [ids]);

	ids.forEach(function(id) {
		// sk_users_{id} -> id
		console.log(namespace + "_" + domain + "_" + id);
		multi.hget(namespace + "_" + domain + "_" + id, identifier);

	});

	multi.exec(callback);
};

/**
 * 返回所有记录
 */
Records.prototype.all = function(callback) {
	callback = callback || noop;
	var namespace = this.namespace,
		domain = this.name,
		identifier = this.identifier,
		redis = this.redis;

	redis.smembers(namespace + ":" + domain + ":" + identifier, function(err, results) {
		if (err) {
			callback(err);
			return;
		}

		var multi = redis.multi();

		results.forEach(function(id) {
			multi.hgetall(namespace + "_" + domain + "_" + id);
		})

		multi.exec(callback);
	});
};

/**
 * 获取满足条件的记录
 */
Records.prototype.get = function(id, callback) {
	var namespace = this.namespace,
		domain = this.name;

	this.redis.hgetall(namespace + "_" + domain + "_" + id, callback);
};

/**
 * 删除记录
 */
Records.prototype.remove = function() {

};

/**
 * 清除所有记录
 */
Records.prototype.clear = function() {

};

/**
 * 更新记录
 */
Records.prototype.update = function() {

};