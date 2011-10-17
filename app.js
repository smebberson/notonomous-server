// define requirements
var sys = require('sys');
var nowjs = require('now');
var express = require('express');
var mongo = require('mongodb');
var _ = require('underscore');

// define constants
var PORT = 8889;

// define variables
var groups = [];

// create the server
var app = express.createServer();

// connect to the database
var db = new mongo.Db('notonomous-dev', new mongo.Server('localhost', mongo.Connection.DEFAULT_PORT, {}), {});

sys.puts('Attempting to connect to mongodb on port ' + mongo.Connection.DEFAULT_PORT);

// open the database
db.open(function (err, db) {
	if (err) {
		sys.puts('Mongodb ' + err);
		process.kill(process.id, 'SIGHUP');
	}
	if (db) sys.puts('Successfully connected to mongodb');
});

// start the application and confirm its running
app.listen(PORT);

// handle exiting routine
process.on('SIGHUP', function () {
	sys.puts('Notonomous-server is exiting. Bye ;)');
	process.exit(0);
});

// init nowjs
var everyone = nowjs.initialize(app);

everyone.now.setUser = function (user) {
	
	// store the users username
	this.now.user = user;
	
	// create a group specifically for the user, allows them to be logged into two locations (i.e. browser & iPad and sync content)
	// define the group in the users now space
	groups[this.now.user] = nowjs.getGroup(this.now.user);
	
	// add this user to the group
	groups[this.now.user].addUser(this.user.clientId);
	
	// alert the client to the fact that we've set the user, we're now ready to save documents
	this.now.userSet(this.user.clientId);
	
}

everyone.now.saveNote = function (note) {
	
	var now = new Date();
	var self = this;
	var toUpdate = {};
	
	// update to the fact that we've synced it
	note.bSynced = true;
	note.syncDelta = now.toJSON();
	note.user = note.user || this.now.user;
	note._id = (note['_id']) ? new db.bson_serializer.ObjectID(note['_id']) : new db.bson_serializer.ObjectID() ;
	
	// build the model that we want to return
	toUpdate.bSynced = note.bSynced;
	toUpdate.syncDelta = note.syncDelta;
	toUpdate.user = note.user;
	toUpdate.id = note.id;
	toUpdate._id = note._id.toString();
	
	// let's save the note to database
	// save the document
	db.collection('documents', function (err, collection) {
		
		if (err) sys.puts(err);
		
		// at present, it's working for insert, but not update
		// update returns a completely different set of arguments, so I need to cover that off
		collection.save(note, {safe: true}, function (pErr) {
			
			// first argument is always the error
			// second argument is
			// 						if we inserted the note: the note itself
			// 						if we updated the note: 1 or 0
			
			if (pErr) sys.puts(pErr);
			
			if (!pErr) {
				// tell everyone in the group (including the client)
				groups[self.now.user].now.noteSaved(err, toUpdate);
			}
			
		});
		
	});
	
}

// advise the server is running
sys.puts('Notonomous-server is listening on http://localhost:' + PORT);