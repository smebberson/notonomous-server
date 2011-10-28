
var sys = require('sys');
var mongo = require('mongodb');

module.exports = function (app) {

	// connect to the database
	var db = new mongo.Db('notonomous-dev', new mongo.Server('localhost', mongo.Connection.DEFAULT_PORT, {}), {});

	sys.puts('Attempting to connect to mongodb on port ' + mongo.Connection.DEFAULT_PORT);

	// open the database
	db.open(function (err, db) {
		if (err) {
			sys.puts('Mongodb error! (' + err + ')');
			// process.kill(process.id, 'SIGHUP');
		}
		if (db) sys.puts('Successfully connected to mongodb');
	});
	
	return db;

}