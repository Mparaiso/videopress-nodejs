"use strict";

var app = require('./index');
var http = require('http');

app.set('port',process.env.VCAP_APP_PORT||3000);

http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app;