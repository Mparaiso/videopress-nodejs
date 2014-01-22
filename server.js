"use strict";
var app, express, http;

express = require('express');
http = require('http');
app = express();
app.set('port', process.env.VCAP_APP_PORT || 3000);
app.get('/', function(request, response) {
	response.end('OK!');
});

http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app;