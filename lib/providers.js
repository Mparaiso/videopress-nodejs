"use strict";
var http=require("http")
, util=require('util')
, config =require('./config')
, duration = require('./duration')
, _ =require('underscore')
, https=require('https')
, request=require('request');
/**
 * [VideoData description]
 * @param {String|Object} title | params : title or a param object with all constructor params
 * @param {String} description 
 * @param {String} thumbnail   
 * @param {String} duration    
 * @param {String} publishedAt 
 * @param {String} originalId  
 * @param {String} provider    
 * @param {String} meta        
 */
function VideoData(title,description,thumbnail,duration,publishedAt,originalId,provider,meta){
	var params;
	if(typeof(params=arguments[0])==='object'){
		this.title=params.title;
		this.description=params.description;
		this.thumbnail=params.thumbnail;
		this.duration=params.duration;
		this.publishedAt=params.publishedAt;
		this.originalId=params.originalId;
		this.provider=params.provider;
		this.meta=params.meta;
	}else{
		this.title=title;
		this.description=description;
		this.thumbnail=thumbnail;
		this.duration=duration;
		this.publishedAt=publishedAt;
		this.originalId=originalId;
		this.provider=provider;
		this.meta=meta;
	}
}
/**
 * Provide access to a website video apiUrl
 * @constructor
 * @param {String} name Provider name
 */
function Provider(name){
	this.name=name;
}

Provider.providers={
	"youtube":"youtube",
	"vimeo":"vimeo",
	"dailymotion":"dailymotion"
};

Provider.prototype={
	/**
	 * get video data from video id
	 * @param  {String}   id       
	 * @param  {Function} callback (err,data)=>{}
	 * @return {Void}            
	 */
	getVideoDataFromId:function(id,callback){}
	/**
	 * get video id from url
	 * @param  {String} url 
	 * @return {String}   
	 */
	, getIdFromUrl:function(url){}
	/**
	 * validate url
	 * @param  {String}  url 
	 * @return {Boolean}   
	 */
	, isValidUrl:function(url){}
	, get request(){
		return this._request || request;
	}
	, set request(value){
		this._request = value;
	}
};

var YoutubeProvider=function(){
	Provider.call(this,"youtube");
	this.regexp = /((http|https):\/\/)?(www\.)?youtube\.com\/watch\?v=(\w+)/;
};

YoutubeProvider.prototype =util._extend(new Provider(),{
	constructor:Provider
	, getIdFromUrl: function(url){
		if(this.isValidUrl(url)){
			var match = url.match(this.regexp);
			return match[match.length-1];
		}
	}
	, isValidUrl: function(url){
		return this.regexp.test(url);
	}
	, getApiUrl: function(videoId,apiKey){
		return "https://www.googleapis.com/youtube/v3/videos?id="
			+videoId
			+"&part=snippet,contentDetails&key="
			+apiKey;
	}
	,getVideoDataFromUrl:function(url,callback){
		var id = this.getIdFromUrl(url);
		return this.getVideoDataFromId(id,callback);
	}
	,getVideoDataFromId:function(id,callback){
		var options = {
			url:this.getApiUrl(id,config.youtube_api_key)
			, json:true
		}
		return this.request(options,function(err,clientResponse,jsonBody){
			var item = jsonBody.items[0],
			title=item.snippet.title,
			description=item.snippet.description,
			thumbnail = item.snippet.thumbnails.default.url,
			_duration=duration.parse(item.contentDetails.duration),
			publishedAt=new Date(item.snippet.publishedAt),
			originalId=item.id,
			provider=Provider.providers['youtube'],
			meta=item;
			//console.log("error:",err);
			return callback(err,new VideoData(title,description,thumbnail,_duration,publishedAt,originalId,provider,meta));
		});
	}
});


module.exports = {
	Provider:Provider
	, YoutubeProvider:YoutubeProvider
	, VideoData:VideoData
};