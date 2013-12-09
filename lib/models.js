"use strict";
var models = exports
, mongoose = require('mongoose')
, config = require("./config");



var db = mongoose.connect(config.mongodb_connection_string);

var VideoSchema = new db.Schema({
	id:mongoose.Schema.ObjectId
	, url:{type:String,required:true}
	, title:String
	, provider:String
	, metadata:Object
});

VideoSchema.methods.getInfosFromUrl=function(url,provider){
	url=url||"";
	provider=provider||"";

};

var Video = db.model('Video',VideoSchema);

module.exports = db;
