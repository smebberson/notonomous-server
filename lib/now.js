
var nowjs = require('now');
var _ = require('underscore');
var Step = require('step');

module.exports = function (log, everyone, groups, db) {

	everyone.now.setUser = function (user, callback) {
		
		var error;
		
		// ensure the user exists in the database
		// if not, don't create the connection using now
		// if so, create the connection using now and continue serving documents
		
		// store the users username
		this.user.user = user;
	
		// create a group specifically for the user, allows them to be logged into two locations (i.e. browser & iPad and sync content)
		// define the group in the users now space
		groups[this.user.user] = nowjs.getGroup(this.user.user);
	
		// add this user to the group
		groups[this.user.user].addUser(this.user.clientId);
	
		// alert the client to the fact that we've set the user, we're now ready to save documents
		// update this to be a callback
		callback(error, this.user.clientId);
		
		log.info('User ' + this.user.user + ' has just joined. Provided the id: ' + this.user.clientId + '.');
	
	};

	everyone.now.saveNote = function (note, callback) {
	
		var now = new Date();
		var self = this;
		var toUpdate = {};
	
		// update to the fact that we've synced it
		note.bSynced = true;
		note.syncDelta = now.toJSON();
		note.lastSaved = now.toJSON();
		note.user = note.user || this.user.user;
		note._id = (note['_id']) ? new db.bson_serializer.ObjectID(note['_id']) : new db.bson_serializer.ObjectID() ;
		
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
					// update the client with the update model
					log.info('Note (%s) saved for user %s.', note._id, note.user);
					callback(err, note);
					// groups[self.now.user].now.noteSaved(err, toUpdate);
				}
			
			});
		
		});
	
	};
	
	everyone.now.deleteNote = function (note, callback) {
		
		var id = new db.bson_serializer.ObjectID(note['_id']);
		var self = this;
		
		db.collection('documents', function (err, collection) {
			
			if (err) sys.puts(err);
			
			collection.remove({_id: id}, {safe: true}, function (pErr) {
				
				if (pErr) sys.puts(pErr);
				
				if (!pErr) {
					// tell everyone in the group (that it's been deleted)
					log.info('Note (%s) deleted for user %s.', note._id, note.user);
					callback(err, note);
					// groups[self.now.user].now.noteDeleted(err, toUpdate);
				}
				
			});
			
		});
		
	};
	
	everyone.now.readSynchronise = function (payload, callback) {
		
		var returnData = {
			persisted: [],
			toReplace: [],
			toDelete: []
		};
		
		var _now = this.now;
		
		var toPersist = payload.toPersist;
		var toCheck = payload.toCheck;
		
		log.info('readSynchronise attempt made for %s (toPersist: %s, toCheck: %s)', this.user.user, toPersist.length, toCheck.length);
		
		// go through the next group of functions in sequence
		Step(
		
			// persist the notes
			function () {
				
				_self = this;
				group = this.group();
				
				if (toPersist.length) {
					
					_(toPersist).each(function (note) {
						_now.saveNote(note, group());
					});

				}
				
			},
			
			// group the persisted notes
			function (err, persistedNotes) {
				
				if (err) throw err;
				
				returnData.persisted = persistedNotes;
				
				// ok, exit this function
				return null;
				
			},
			
			// go through previously persisted notes, do we need to update
			// them with more recent versions from another client (i.e. iPad)
			function (err) {
				
				if (err) throw err;
				
				// ok, let's execute callback now and we can implement
				// the rest of the funcitonality at another time
				
				callback(null, returnData);
				
			}
		
		);
		
	}

}