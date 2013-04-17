orz
===

A simple redis data layer framework

##install
With [npm](http://npmjs.org) do:
```
npm install orz
```

##example

``` js
var orz = require('orz')(),
  // create a new schema
	users = orz.get('name', {
		properties: {
			id: {
				identifier: true,
				type: 'int'
			},
			name: {
				index: true,
				type: 'string'
			},
			email: {
				type: 'string'
			}
		}
	});

// create a new record
users.create({
	id: 123,
	name: 'Peter Gao',
	email: 'gxcsoccer@126.com'
}, function(err, results) {
	if (err) {
		console.error(err);
		return;
	}

	// get record by id
	users.get(123, function(err, result) {
		if (err) {
			console.error(err);
			return;
		}
		console.log(result);
	});
});
```
###output

```
$ node test.js
{ id: 123, name: 'Peter Gao', email: 'gxcsoccer@126.com' }
```

##methods

``` js
var orz = require('orz');
```

###var r = orz(option={})

init orz object using following options

option:
* namespace 	--optional, if not set, default value will be "orz"
* redis	 	--optional, if set, use the existing redis connection
* port	 	--optional, the redis server port number
* host		--optional, the redis server host
* password	--optional, the password for redis authentication
* database	--optional, the database number of redis

###r.get(schema)
get exists schema by name, or create a new schema

return: a Record object


##Record API

###Record.all(...)

get all records in this collection
``` js
r.get('users').all(function(err, records) {
	// ...
});
```

###Record.count(...)

get the total count of this collection
``` js
r.get('users').count(function(err, count) {
	// ...
});
```

###Record.get(...)

get one record or several records by id/ids
``` js
r.get('users').get(123, function(err, user) {
	// ...
});

r.get('users').get([123, 222], function(err, users) {
	// ...
});
```

###Record.where(...)

query record(s) 
``` js
// using function
r.get('users').where(function(u) {
	return u.name == 'Peter Gao'
}, function(err, users) {
	// ...
});

// using object
r.get('users').where({
	name: 'Pater Gao'
}, function(err, users) {
	// ...
});
```

###Record.update(...)

update record(s)
``` js
r.get('users').update({
	id: 123,
	name: 'GaoXiaochen'
}, function(err) {
	// ...
});
```

###Record.remove(...)

remove record(s)
``` js
r.get('users').remove(123, function(err) {
	// ...
});
```

###Record.clear(...)

clear all records in this collection
``` js
r.get('users').clear(function(err) {
	// ...
});
```

##tools

###mysql2redis
this tool can help u to generate schema automatically. it schema will save to a .json file in './schema' folder
``` js
var mysql2redis = require('./tool/mysql2redis');
mysql2redis.getSchema('orz', 'users');

```
