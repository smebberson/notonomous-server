
var sys = require('sys');
var mongo = require('mongodb');

module.exports = function (app, log) {

	// connect to the database
	var db = new mongo.Db('notonomous-dev', new mongo.Server('localhost', mongo.Connection.DEFAULT_PORT, {}), {});

	log.trace('Attempting to connect to mongodb on port %s', mongo.Connection.DEFAULT_PORT);

	// open the database
	db.open(function (err, db) {
		if (err) {
			log.error('A mongodb error has occurred: ' + err);
		}
		if (db) log.info('Successfully connected to mongodb');
	});
	
	return db;

}