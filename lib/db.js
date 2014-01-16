"use strict";
var mongoose = require('mongoose')
    , config = require('./config')
    , util = require('util')
    , YoutubeUrlParser = require('./video-urlparser').parsers.YoutubeUrlParser
    , Schema = mongoose.Schema
    , VideoSchema , Video , PlaylistSchema , Playlist , UserSchema, User ; 

mongoose.set('debug', config.debug || config.db.debug);

UserSchema = mongoose.Schema({
    nickname: String
});
User = mongoose.model('User', UserSchema);

VideoSchema = mongoose.Schema({
    url: {type: String},
    owner: { type: Schema.Types.ObjectId, ref: 'User'},
    title: String, description: String,
    duration: Object,
    publishedAt: {type: Date, default: Date.now},
    originalId: String,
    provider: String,
    thumbnail: String,
    meta: Object
});

// create video from video url
VideoSchema.statics.fromUrl=function(url,callback){
    var youtubeUrlParser = new YoutubeUrlParser(config.youtube_api_key);
    if(youtubeUrlParser.isValidUrl(url)){
        return youtubeUrlParser.getVideoDataFromUrl(url,function(err,res){
            var video = new Video(res);
            return video.save(callback);
        });
    }
    return callback(new Error(util.format("Video with url % not found",url)));
};

Video = mongoose.model('Video', VideoSchema);

PlaylistSchema = mongoose.Schema({
    title: String,
    description: String,
    videos: [VideoSchema]
});

Playlist = mongoose.model('Playlist', PlaylistSchema);

/*mongoose.connection.on('connected',function(){
    //console.log('connect',arguments);
});*/

module.exports = mongoose;