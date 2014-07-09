"use strict";
var app, container, http;

http = require('http');


if (process.env.NODE_ENV === "production"  ) {
	require('source-map-support').install();
	container = require('./js/container');
} else {
	require('coffee-script').register();
	container = require('./coffee/container');
}

if (!module.parent) {
	http.createServer(container.app).listen(container.port, function() {
		console.log("listening on port : ".concat(container.port));
	});
} else {
	module.exports = container;
}
