"use strict";
var mocks = exports;

var _ = require('underscore')
, path=require('path')
, fs = require('fs')
, util=require('util');

var youtubeUrlRequests = [
	{
		url:"https://www.googleapis.com/youtube/v3/videos?id=7lCDEYXw3mM&part=snippet,contentDetails",
		responseFile:path.resolve(path.join(__dirname,"../stubs/youtube-video-id-7lCDEYXw3mM.json"))
	}
];

mocks.youtubeRequestMock = function(options,callback){
	var url = options.url || options.uri
	, f = youtubeUrlRequests.filter(function(item){
		return url.indexOf(item.url)>=0;
	})[0];
	if(f){
		var file=f.responseFile
		, json = require(file);
		return callback(null,null,json);
	}
	return callback(new Error(util.format("%s not found",url)));
};