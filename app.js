/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
"use strict";
var app, container, http;

http = require('http');
var numCPUs=require('os').cpus().length;
var cluster = require('cluster');
var i;
if (process.env.NODE_ENV === "production"  ) {
    require('source-map-support').install();
    container = require('./js/container');
} else {
    require('coffee-script').register();
    container = require('./coffee/container');
}

if (!module.parent) {
    if(process.env.NODE_ENV==="production" && cluster.isMaster ){
        /*fork processes*/
        for(i=0;i<numCPUs;i++){
            cluster.fork();
        }
    }else{
        if(container.ip){
            http.createServer(container.app).listen(container.port,container.ip, function() {
                console.log("listening on "+container.ip+":"+container.port);
            });
        }else{
            http.createServer(container.app).listen(container.port ,function() {
                console.log("listening on port :"+container.port);
            });
        }
    }
} else {
    module.exports = container;
}
