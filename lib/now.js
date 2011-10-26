
var nowjs = require('now');

module.exports = function (everyone, groups, db) {

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
		
		console.log('User ' + this.now.user + ' has just joined. Provided the id: ' + this.user.clientId + '.');
	
	};

	everyone.now.saveNote = function (note, callback) {
	
		var now = new Date();
		var self = this;
		var toUpdate = {};
	
		// update to the fact that we've synced it
		note.bSynced = true;
		note.syncDelta = now.toJSON();
		note.user = note.user || this.now.user;
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
					callback(err, note);
					// groups[self.now.user].now.noteDeleted(err, toUpdate);
				}
				
			});
			
		});
		
	};

}