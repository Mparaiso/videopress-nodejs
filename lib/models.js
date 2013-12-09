"use strict";
var models = exports
, mongoose = require('mongoose')
, config = require("./config");



var db = mongoose.connect(config.mongodb_connection_string);
/**
 * CONFIGURATION
 */
db.set("debug",config.db.debug);
var VideoSchema = new db.Schema({
	id:mongoose.Schema.ObjectId
	, url:{type:String,required:true}
	, title:String
	, description:String
	, duration:Object
	, publishedAt:Date
	, originalId:String
	, provider:String
	, thumbnail:String
	, meta:Object
});

VideoSchema.static.createFromUrl=function(url){

};

var Video = db.model('Video',VideoSchema);

module.exports = db;
