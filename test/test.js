var chai = require('chai'),
	should = chai.should(),
	expect = chai.expect,
	rom = require('../')();

describe('CURD', function() {
	var users = rom.get(require('../schema/users.json'));

	before(function(done) {
		users.clear(done);
	});

	describe('create', function() {
		it('the init count should be zero', function(done) {
			users.count(function(err, count) {
				if (err) throw err;
				count.should.equal(0);
				done();
			});
		});


		it('should be able to create a new record', function(done) {
			users.create([{
				id: 123,
				name: 'GaoXiaochen',
				email: 'gxcsoccer@126.com',
				birthday: new Date()
			}, {
				id: 2,
				name: 'YeYunyi',
				email: 'gxcsoccer@126.com',
				birthday: new Date()
			}], function(err) {
				if (err) throw err;

				users.count(function(err, count) {
					if (err) throw err;
					count.should.equal(2);
					done();
				});
			});
		});

		it('should not create new record, if record already exists', function(done) {
			users.create({
				id: 123,
				name: 'GaoXiaochen',
				email: 'gxcsoccer@126.com'
			}, function(err) {
				should.exist(err);
				done();
			});
		});

		it('should be able to judge whether records are exists', function(done) {
			users.exists([123, 111], function(err, results) {
				if (err) throw err;
				results.should.length(2);
				results[0].should.equal(123);
				expect(results[1]).to.be.null;
				done();
			});

		});
	});

	describe('read', function() {
		it('should be able to get all records', function(done) {
			users.all(function(err, records) {
				if (err) throw err;
				records.should.length(2);
				done();
			});
		});

		it('should be able to get record by id', function(done) {
			users.get(123, function(err, result) {
				if (err) throw err;
				result.should.have.property('name').with.equal('GaoXiaochen');
				done();
			});
		});

		it('should be able to get record by ids', function(done) {
			users.get([123, 456, 333], function(err, results) {
				if (err) throw err;
				results.should.length(3);
				results[0].should.have.property('email').with.equal('gxcsoccer@126.com');
				expect(results[1]).to.be.null;
				expect(results[2]).to.be.null;
				done();
			});
		});

		it('should be able to query using criteria', function(done) {
			users.where({
				name: 'GaoXiaochen'
			}, function(err, results) {
				if (err) throw err;
				results.should.length(1);
				results[0].should.have.property('email').with.equal('gxcsoccer@126.com');
				done();
			})
		});

		it('should be able to query using filter condition', function(done) {
			users.where(function(res) {
				return res.name == 'YeYunyi';
			}, function(err, results) {
				if (err) throw err;
				results.should.length(1);
				results[0].should.have.property('id').with.equal(2);
				done();
			})
		});
	});

	describe('update', function() {
		it('should be able to update record', function(done) {
			users.update({
				id: 123,
				name: 'Peter Gao'
			}, function(err, result) {
				if (err) throw err;
				users.get(123, function(err, result) {
					if (err) throw err;
					result.should.have.property('name').with.equal('Peter Gao');
					result.should.have.property('email').with.equal('gxcsoccer@126.com');
					done();
				});
			});
		});
	});

	describe('remove', function() {
		it('should be able to remove record', function(done) {
			users.remove(123, function(err, result) {
				if (err) throw err;
				users.count(function(err, count) {
					if (err) throw err;
					count.should.equal(1);
					done();
				})
			})
		});
	});
})