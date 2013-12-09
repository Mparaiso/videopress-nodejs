"use strict";

var mongoose = require('mongoose')
, config = require("./config")
, providers = require('./providers')
, Video ,VideoSchema;

var ProviderClasses = [
providers.YoutubeProvider
];

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
 VideoSchema.static.fromUrl=function(url,callback){
 	ProviderClasses.some(function(Class){
 		var _c = new Class();
 		if(_c.isValidUrl(url)){
 			_c.getVideoDataFromUrl(url,function(err,videoData){
 				if(!err){
 					var video new mongoose.models.Video(videoData);
 				}
 				return callback(err,video);
 			});
 			return true;
 		}
 	});
 };
 Video = mongoose.model('Video',VideoSchema);

 module.exports = mongoose;