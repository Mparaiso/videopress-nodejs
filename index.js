"use strict";

var express = require("express"),
    http = require('http'),
    path = require('path'),
    util = require('util'),
    config = require('./lib/config'),
    routes = require('./lib/routes'),
    logger = require('./lib/logger'),
    db = require('./lib/db'),
    Video = db.model('Video');


var app = express();

app.on("error", function(err) {
    if (app.get('logger')) {
        app.get('logger').error(err instanceof Error ? err.stack : err);
    }
});

app.configure('testing', function() {
    app.use(logger.middleware(app, "testing"));
});

if (app.get('env') !== 'testing') {
    db.connect(config.db.connection_string);
}

app.configure("development", function() {
    app.use(logger.middleware(app, "development"));
    app.use(express.logger('dev'));
    app.use(require('less-middleware')({
        src: __dirname + "/public/stylesheets"
    }));
});
app.configure(function() {
    app.set('view engine', 'jade');
    app.use(express.static('public'));
    app.use(express.favicon());
    app.use(express.json());
    app.use(express.compress());
    app.set('port', process.env.PORT || 3000);
    app.locals(config.locals);
});

/**
 * ROUTES
 */
//create a video record from a video url
app.post("/api/video.fromUrl", function(req, res, next) {
    Video.fromUrl(req.query.url, function(err, result) {
        if (err) {
            app.emit('error', err);
            return res.send(500, {
                error: 'Error Creating Video'
            });
        }
        return res.json(200, result);
    });
});
app.use("/api/video", routes.video);
app.use("/api/playlist", routes.playlist);
app.get('/', function(req, res) {
    res.render('index');
});

module.exports = app;

if (!module.parent) {
    http.createServer(app).listen(app.get('port'), function() {
        console.log('Express server listening on port ' + app.get('port'));
    });
}