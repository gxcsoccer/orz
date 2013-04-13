var slice = Array.prototype.slice;

var Records = function(redis, schema) {
		this.redis = redis;
		this.schema = schema;
	};

/**
 * 构造一条或多条记录
 */
Records.prototype.create = function(records, option, callback) {
	var args = slice.call(arguments, 0);

	if (args.length === 2 && typeof args[1] === 'function') {
		callback = option;
		option = {};
	}

	if (!Array.isArray(records)) {
		records = [records];
	}


};

/**
 * 检查记录是否存在
 */
Records.prototype.exists = function(records, callback) {
	var redis = this.redis,
		multi = redis.multi(),
		namespace = this.schema.namespace,
		identifier = this.schema.identifier;

	records.forEach(function(record) {
		if (typeof record === 'object') {
			if (record[identifier] != null) {
				recordId = record[identifier];
				multi.hget("" + db + ":" + name + ":" + recordId, identifier);
			} else {
				for (property in unique) {
					if (record[property] != null) {
						multi.hget("" + db + ":" + name + "_" + property, record[property]);
					}
				}
			}
		} else {
			multi.hget("" + db + ":" + name + ":" + record, identifier);
		}


	});

};

/**
 * 返回所有记录
 */
Records.prototype.all = function() {

};

/**
 * 获取满足条件的记录
 */
Records.prototype.get = function() {

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