"use strict";
var models = exports
, mongoose = require('mongoose')
, config = require("./config")
, providers = require('./providers')
, db = require('./database');


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
