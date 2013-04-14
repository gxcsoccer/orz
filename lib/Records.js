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
	callback = callback || noop;
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
		if (err) {
			return callback(err);
		}
		for (var i = 0, len = ids.length; i < len; i++) {
			if (ids[i] != null) {
				return callback(new Error('Record ' + ids[i] + ' already exists'));
			}
		}

		var multi = redis.multi();

		records.forEach(function(record) {
			// id加入set
			multi.sadd(namespace + ':' + domain + ':' + identifier, record[identifier]);
			// 保存为hash
			multi.hmset(namespace + '_' + domain + '_' + record[identifier], record);
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
		multi.hget(namespace + '_' + domain + '_' + id, identifier);
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

	redis.smembers(namespace + ':' + domain + ':' + identifier, function(err, results) {
		if (err) {
			callback(err);
			return;
		}

		var multi = redis.multi();

		results.forEach(function(id) {
			multi.hgetall(namespace + '_' + domain + '_' + id);
		})

		multi.exec(callback);
	});
};

/**
 * 获取满足条件的记录
 */
Records.prototype.get = function(ids, callback) {
	callback = callback || noop;
	var namespace = this.namespace,
		domain = this.name,
		redis = this.redis,
		multi = redis.multi(),
		isArray = Array.isArray(ids);

	!isArray && (ids = [ids]);

	ids.forEach(function(id) {
		multi.hgetall(namespace + '_' + domain + '_' + id);
	});

	multi.exec(function(err, results) {
		if (err) {
			callback(err);
		} else {
			callback(null, isArray ? results : results[0]);
		}
	});
};

/**
 * 删除记录
 */
Records.prototype.remove = function(ids, callback) {
	callback = callback || noop;
	var namespace = this.namespace,
		domain = this.name,
		identifier = this.identifier,
		redis = this.redis,
		multi = redis.multi(),
		isArray = Array.isArray(ids);

	!isArray && (ids = [ids]);

	ids.forEach(function(id) {
		multi.srem(namespace + ':' + domain + ':' + identifier, id);
		multi.del(namespace + '_' + domain + '_' + id);
	});

	multi.exec(callback);
};

/**
 * 清除所有记录
 */
Records.prototype.clear = function(callback) {
	callback = callback || noop;
	var namespace = this.namespace,
		domain = this.name,
		identifier = this.identifier,
		redis = this.redis;

	redis.smembers(namespace + ':' + domain + ':' + identifier, function(err, results) {
		if (err) {
			callback(err);
			return;
		}

		var multi = redis.multi();

		results.forEach(function(id) {
			multi.del(namespace + '_' + domain + '_' + id);
		});

		multi.del(namespace + ':' + domain + ':' + identifier);
		multi.exec(callback);
	});
};

/**
 * 更新记录
 */
Records.prototype.update = function(records, callback) {
	callback = callback || noop;
	var namespace = this.namespace,
		domain = this.name,
		identifier = this.identifier,
		isArray = Array.isArray(records),
		redis = this.redis;

	!isArray && (records = [records]);

	this.exists(_.pluck(records, identifier), function(err, ids) {
		if (err) {
			return callback(err);
		}
		for (var i = 0, len = ids.length; i < len; i++) {
			if (ids[i] == null) {
				return callback(new Error('Record ' + ids[i] + ' dose not exists.'));
			}
		}

		var multi = redis.multi();

		records.forEach(function(record) {
			// 保存为hash
			multi.hmset(namespace + '_' + domain + '_' + record[identifier], record);
			// TODO: index & unique
		});

		multi.exec(callback);
	});
};

/**
 * 获取记录总数
 */
Records.prototype.count = function(callback) {
	callback = callback || noop;
	var namespace = this.namespace,
		domain = this.name,
		identifier = this.identifier,
		redis = this.redis;

	redis.scard(namespace + ':' + domain + ':' + identifier, callback);
}