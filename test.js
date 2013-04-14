var rom = require('./lib/rom')();

var users = rom.get(require('./schema/users.json'));

// users.create({
// 	id: 123,
// 	name: 'GaoXiaochen',
// 	email: 'gxcsoccer@126.com'
// }, function(err) {
// 	if(err) {
// 		throw err;
// 	}
// 	users.get(123, function(err, result) {
// 		console.log(result);
// 	});
// });
users.get(123, function(err, result) {
	console.log(result);
});

users.all(function(err, records) {
	console.log(records);
});