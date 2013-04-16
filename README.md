rom
===

A simple redis data layer framework

##example

``` js
var rom = require('rom')(),
  // create a new schema
	users = rom.get('name', {
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
var rom = require('rom');
```

###var r = rom(option={})


###r.get(schema)


###Record.all(...)

###Record.count(...)

###Record.get(...)

###Record.where(...)

###Record.update(...)

###Record.remove(...)

###Record.clear(...)


