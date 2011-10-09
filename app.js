// define requirements
var sys = require('sys');
var nowjs = require('now');
var express = require('express');

// define constants
var PORT = 8889;

// define variables
var groups = [];

// create the server
var app = express.createServer();

// start the application and confirm its running
app.listen(PORT);

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

// advise the server is running
sys.puts('Notonomous-server is listening on http://localhost:' + PORT);