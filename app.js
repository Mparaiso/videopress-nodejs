"use strict";
require('source-map-support').install();
var app, container;
container = require('./js/container');
module.exports = app = container.app;
app.set('container', container);
if (!module.parent) {
	app.listen(container.port, function() {
		console.log("listening on port ".concat(container.port));
	});
}