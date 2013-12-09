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
 VideoSchema.statics.fromUrl=function(url,callback){
 	ProviderClasses.some(function(ProviderClass){
 		var provider = new ProviderClass();
 		if(provider.isValidUrl(url)){
 			var video;
 			provider.getVideoDataFromUrl(url,function(err,videoData){
 				if(!err){
 					video =new mongoose.models.Video(videoData);
 				}
 				return callback(err,video);
 			});
 			return true;
 		}
 	});
 };
 Video = mongoose.model('Video',VideoSchema);

 module.exports = mongoose;