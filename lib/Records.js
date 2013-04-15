var util = require('util'),
	_ = require('underscore'),
	Schema = require('./Schema'),
	slice = Array.prototype.slice;

function noop() {}

var Records = function(redis, option) {
		this.redis = redis;

		Schema.call(this, option);

		this.PUBLIC_KEY_PREFIX = this.namespace + '_' + this.name + '_';
		this.PRIVATE_KEY_PREFIX = this.namespace + ':' + this.name + ':';
	};

util.inherits(Records, Schema);

module.exports = Records;

/**
 * 构造一条或多条记录
 */
Records.prototype.create = function(records, option, callback) {
	callback = callback || noop;
	var args = slice.call(arguments, 0),
		identifier = this.identifier,
		redis = this.redis,
		isArray = Array.isArray(records),
		me = this;

	if (args.length === 2 && typeof args[1] === 'function') {
		callback = option;
		option = {};
	}

	!isArray && (records = [records]);

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
		me.serialize(records).forEach(function(record) {
			// id加入set
			multi.sadd(me.PRIVATE_KEY_PREFIX + identifier, record[identifier]);
			// 保存为hash
			multi.hmset(me.PUBLIC_KEY_PREFIX + record[identifier], record);
			// TODO: index & unique
			me.index.forEach(function(prop) {
				multi.sadd(me.PRIVATE_KEY_PREFIX + prop + ':' + me.hash(record[prop]), record[identifier])
			});
		});
		multi.exec(callback);
	});
};

/**
 * 检查记录是否存在
 */
Records.prototype.exists = function(ids, callback) {
	callback = callback || noop;
	var redis = this.redis,
		multi = redis.multi(),
		identifier = this.identifier,
		me = this;

	!Array.isArray(ids) && (ids = [ids]);

	ids.forEach(function(id) {
		// sk_users_{id} -> id
		multi.hget(me.PUBLIC_KEY_PREFIX + id, identifier);
	});

	multi.exec(function(err, results) {
		if (err) {
			callback(err);
		} else {
			callback(null, results.map(function(res, index) {
				return (res != null) ? ids[index] : res;
			}));
		}
	});
};

/**
 * 返回所有记录
 */
Records.prototype.all = function(callback) {
	callback = callback || noop;
	var identifier = this.identifier,
		redis = this.redis,
		me = this;

	redis.smembers(this.PRIVATE_KEY_PREFIX + identifier, function(err, results) {
		if (err) {
			callback(err);
			return;
		}

		var multi = redis.multi();
		results.forEach(function(id) {
			multi.hgetall(me.PUBLIC_KEY_PREFIX + id);
		})
		multi.exec(function(err, results) {
			if (err) {
				callback(err);
			} else {
				callback(null, me.deserialize(results));
			}
		});
	});
};

/**
 * 获取满足条件的记录
 */
Records.prototype.get = function(ids, callback) {
	callback = callback || noop;
	var redis = this.redis,
		multi = redis.multi(),
		isArray = Array.isArray(ids),
		me = this;

	!isArray && (ids = [ids]);

	ids.forEach(function(id) {
		multi.hgetall(me.PUBLIC_KEY_PREFIX + id);
	});

	multi.exec(function(err, results) {
		if (err) {
			callback(err);
		} else {
			results = me.deserialize(results);
			callback(null, isArray ? results : results[0]);
		}
	});
};

/** 
 * 查询
 */
Records.prototype.where = function(criteria, callback) {
	callback = callback || noop;
	var redis = this.redis,
		multi = this.redis.multi(),
		identifier = this.identifier,
		me = this;

	if (typeof criteria === 'function') {
		this.all(function(err, results) {
			if (err) {
				callback(err);
			} else {
				callback(null, _.filter(results, criteria));
			}
		});
	} else if (typeof criteria === 'object') {
		var id = criteria[identifier];

		this.index.forEach(function(prop) {
			if (criteria[prop] != null) {
				multi.smembers(me.PRIVATE_KEY_PREFIX + prop + ':' + me.hash(criteria[prop]));
			}
		});

		multi.exec(function(err, results) {
			if (err) {
				callback(err);
			} else {
				id != null && results.push([id]);
				results = _.intersection.apply(_, results);
				if (results.length) {
					me.get(results, callback);
				} else {
					callback(null, results);
				}
			}
		})
	} else {
		this.get(criteria, callback);
	}
};

/**
 * 删除记录
 */
Records.prototype.remove = function(ids, callback) {
	callback = callback || noop;
	var identifier = this.identifier,
		redis = this.redis,
		multi = redis.multi(),
		isArray = Array.isArray(ids),
		me = this;

	!isArray && (ids = [ids]);

	if (this.index.length) {
		this.get(ids, function(err, results) {
			if (err) {
				callback(err);
			} else {
				multi.srem.apply(multi, [me.PRIVATE_KEY_PREFIX + identifier].concat(ids));
				multi.del.apply(multi, ids.map(function(id) {
					return me.PUBLIC_KEY_PREFIX + id;
				}));
				// remove index
				results.forEach(function(res) {
					me.index.forEach(function(prop) {
						multi.srem(me.PRIVATE_KEY_PREFIX + prop + ':' + me.hash(res[prop]), res[identifier]);
					});
				});

				multi.exec(callback);
			}
		});
	} else {
		multi.srem.apply(multi, [this.PRIVATE_KEY_PREFIX + identifier].concat(ids));
		multi.del.apply(multi, ids.map(function(id) {
			return me.PUBLIC_KEY_PREFIX + id;
		}));
		multi.exec(callback);
	}
};

/**
 * 清除所有记录
 */
Records.prototype.clear = function(callback) {
	callback = callback || noop;
	var identifier = this.identifier,
		redis = this.redis,
		me = this;

	redis.smembers(this.PRIVATE_KEY_PREFIX + identifier, function(err, results) {
		if (err) {
			callback(err);
			return;
		}

		var multi = redis.multi();

		results.forEach(function(id) {
			multi.del(me.PUBLIC_KEY_PREFIX + id);
		});

		multi.del(me.PRIVATE_KEY_PREFIX + identifier);
		multi.exec(callback);
	});
};

/**
 * 更新记录
 */
Records.prototype.update = function(records, callback) {
	callback = callback || noop;
	var identifier = this.identifier,
		isArray = Array.isArray(records),
		redis = this.redis,
		me = this;

	!isArray && (records = [records]);

	this.get(_.pluck(records, identifier), function(err, results) {
		if (err) {
			return callback(err);
		}
		for (var i = 0, len = results.length; i < len; i++) {
			if (results[i] == null) {
				return callback(new Error('Record ' + records[i][identifier] + ' dose not exists.'));
			}
		}

		var multi = redis.multi();
		me.serialize(records).forEach(function(record, index) {
			// 保存为hash
			multi.hmset(me.PUBLIC_KEY_PREFIX + record[identifier], record);
			// update index
			me.index.forEach(function(prop) {
				if (record[prop] != null && results[index][prop] != record[prop]) {
					multi.srem(me.PRIVATE_KEY_PREFIX + prop + ':' + me.hash(results[index][prop]), record[identifier]);
					multi.sadd(me.PRIVATE_KEY_PREFIX + prop + ':' + me.hash(record[prop]), record[identifier]);
				}
			});
		});
		multi.exec(callback);
	});
};

/**
 * 获取记录总数
 */
Records.prototype.count = function(callback) {
	callback = callback || noop;
	var identifier = this.identifier,
		redis = this.redis;

	redis.scard(this.PRIVATE_KEY_PREFIX + identifier, callback);
}