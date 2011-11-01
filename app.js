// define requirements
var sys = require('sys');
var nowjs = require('now');
var express = require('express');
var log4js = require('log4js');

// setup logging
log4js.configure('./log4js.json');
var log = log4js.getLogger('ns');

// define constants
var PORT = 8889;

// define variables
var groups = [];

// create the server
var app = express.createServer();

// database
var db = require('./lib/database')(app, log);

// routes
require('./routes/notes')(app, log, db);

// start the application and confirm its running
app.listen(PORT);

// this will capture the control+c key command
process.on('SIGINT', function () {
	// tidy up the application
	log.info('Notonomous-server is exiting. Bye.');
	// quit the server
	process.kill(process.id, 'SIGHUP');
});

// handle exiting routine
process.on('SIGHUP', function () {
	sys.puts('Notonomous-server is exiting. Bye.');
	process.exit(0);
});

// init nowjs
var everyone = nowjs.initialize(app);
require('./lib/now.js')(log, everyone, groups, db);

// advise the server is running
log.info('Notonomous-server started at http://localhost:%s', PORT);
sys.puts('Notonomous-server is listening on http://localhost:' + PORT);