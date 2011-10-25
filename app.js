// define requirements
var sys = require('sys');
var nowjs = require('now');
var express = require('express');
var _ = require('underscore');

// define constants
var PORT = 8889;

// define variables
var groups = [];

// create the server
var app = express.createServer();

// database
var db = require('./lib/database')(app);

// routes
require('./routes/notes')(app, db);

// start the application and confirm its running
app.listen(PORT);

// handle exiting routine
process.on('SIGHUP', function () {
	sys.puts('Notonomous-server is exiting. Bye ;)');
	process.exit(0);
});

// init nowjs
var everyone = nowjs.initialize(app);
require('./lib/now.js')(everyone, groups, db);

// advise the server is running
sys.puts('Notonomous-server is listening on http://localhost:' + PORT);