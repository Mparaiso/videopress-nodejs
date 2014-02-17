"use strict";
require('source-map-support').install();
var app, container;

if (process.env.NODE_ENV == "production" || process.env.NODE_ENV == "testing") {
    container = require('./js/container');
} else {
    require('coffee-script').register();
    container = require('./coffee/container');
}

app = container.app;
app.set('container', container);
if (!module.parent) {
    app.listen(container.port, function () {
        console.log("listening on port ".concat(container.port));
    });
} else {
    module.exports = app;
}