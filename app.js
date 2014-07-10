/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
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
    if(container.ip){
        http.createServer(container.app).listen(container.port,container.ip, function() {
            console.log("listening on "+container.ip+":"+container.port);
        });
    }else{
        http.createServer(container.app).listen(container.port ,function() {
            console.log("listening on port :"+container.port);
        });
    }
} else {
	module.exports = container;
}
