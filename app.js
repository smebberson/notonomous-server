// define requirements
var sys = require('sys');
var nowjs = require('now');
var express = require('express');

// define constants
var PORT = 8889;

// create the server
var app = express.createServer();

// start the application and confirm its running
app.listen(PORT);

// init nowjs
var everyone = nowjs.initialize(app);

// advise the server is running
sys.puts('Notonomous-server is listening on http://localhost:' + PORT);