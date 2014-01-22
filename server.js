"use strict";
var app, express, http;
express = require('express');
http = require('http');
app = express();
app.set('port', process.env.VCAP_APP_PORT || 3000);
app.use(express.favicon());
app.get('/', function(req, res) {
	res.end('OK!');
});
app.listen(process.env.VCAP_APP_PORT || 3000);