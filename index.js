// test express
//@NOTE @NODE @EXPRESS import du module
"use strict";

var express = require("express")
    , http = require('http')
    , path = require('path')
    , util = require('util')
    , config = require('./lib/config')
    , routes = require('./lib/routes')
    , db = require('./lib/db')
    , Video = db.model('Video');
    
var app = express();
app.configure("development", function () {
    app.use(express.logger('dev'));
    app.use(require('less-middleware')({src:__dirname+"/public/stylesheets"}));
});
app.configure(function () {
    app.set('view engine','jade');
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
app.post("/api/video.fromVideoUrl",function(req,res){
    var url= req.params.url;
    res.json(200,{url:url});
});
app.use("/api/video", routes.video);
app.use("/api/playlist", routes.playlist);
//homepage
app.on("test",function(){
    console.log("test",arguments);
});
app.get('/', function (req, res) {
    res.render('index');
});

module.exports = app;

if (!module.parent) {
    http.createServer(app).listen(app.get('port'), function () {
        console.log('Express server listening on port ' + app.get('port'));
    });
}