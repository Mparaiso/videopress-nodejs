/*jslint node:true,white:true,nomen:true*/
/**
 * Module dependencies.
 */
"use strict";
var express = require('express')
 , routes = require('./routes')
 , user = require('./routes/user')
 , http = require('http')
 , path = require('path');

var swig=require('swig')
, less_middleware=require('less-middleware')
, lib=require('./lib');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.engine('twig',swig.renderFile);
app.set('view engine', 'twig');
app.set('views', __dirname + '/views');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
//@note @node @express : compiler automatiquement les fichiers less , https://github.com/emberfeather/less.js-middleware
app.use(less_middleware({src:path.join(__dirname,"/public/stylesheets/css"),compress:true}));
app.use(express.static(path.join(__dirname, 'public')));

// development only
app.configure('development',function(){
	app.use(express.errorHandler());
});

app.locals(lib.locals);

app.get('/', routes.index);
app.get('/users', user.list);

module.exports = app;

if (!module.parent) {
    http.createServer(app).listen(app.get('port'), function(){
        console.log('Express server listening on port ' + app.get('port'));
    });
}

