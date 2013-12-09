"use strict";

var mongoose = require('mongoose')
, config = require("./config")
, Video ,VideoSchema;

mongoose.connect(config.mongodb_connection_string);
/**
 * CONFIGURATION
 */
mongoose.set("debug",config.db.debug);

VideoSchema = new mongoose.Schema({
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
VideoSchema.static.createFromUrl=function(url){/* */};
Video = mongoose.model('Video',VideoSchema);

module.exports = mongoose;