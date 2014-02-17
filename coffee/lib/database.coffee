"use strict"

mongoose = require 'mongoose'
parsers = require './parsers'
util = require 'util'
config = require './config'
async = require 'async'
bcrypt = require 'bcrypt-nodejs'

YoutubeVideo = parsers.YoutubeVideo

SessionSchema = mongoose.Schema
    sid:String
    session:Object

Session = mongoose.model('Session',SessionSchema)

# define the user schema
UserSchema = mongoose.Schema
    roles:{type:Array,default:['user']}
    username:String
    isAccountNonExpired:{type:Boolean,default:true}
    isEnabled:{type:Boolean:default:true}
    isCredentialsNonExpired:{type:Boolean,default:true}
    isAccountNonLocked:{type:Boolean,default:true}
    local:
        email:String
        password:String
    facebook:
        id:String
        token:String
        email:String
        name:String
    twitter:
        id:String
        token:String
        displayName:String
        username:String
    google:
        id:String
        token:String
        email:String
        name:String

### Hash generation ###
UserSchema.methods.generateHash = (password)->
    bcrypt.hashSync(password,bcrypt.genSaltSync(8),null)
### check password ###
UserSchema.methods.validPassword = (password)->
    bcrypt.compareSync(password,this.local.password)

User = mongoose.model('User', UserSchema)

VideoSchema = mongoose.Schema
    url: {type: String},
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    title: String,
    description: String,
    categoryId:Number,
    duration: Object,
    created_at:{type:Date,'default':Date.now},
    updated_at:{type:Date,'default':Date.now},
    publishedAt: { type: Date, 'default': Date.now},
    originalId: String,
    provider: String,
    thumbnail: String,
    meta: Object

### create video from video url ###
VideoSchema.statics.fromUrl = (url, callback)->
    youtubeVideo = new YoutubeVideo(config.youtube_apikey)
    if youtubeVideo.isValidUrl(url)
        youtubeVideo.getVideoDataFromUrl url, (err, res)->
            if err then callback(new Error(util.format("Video with url %s not found", url)))
            else video = new Video(res) ; video.save(callback)
    else callback(new Error(util.format("Video with url %s not found", url)))

VideoSchema.methods.toString = ->
    this.title

###
 * find Similar 
 * @param  {Video}   video   
 * @param  {Object}   options  
 * @param  {Function} callback 
###
VideoSchema.statics.findSimilar = (video,options,callback)->
    if arguments.length==2 
        callback = options 
        options = {}
    @find {categoryId:video.categoryId,_id:{'$ne':video.id}},null,options,(err,res)->
        callback(err,res)

Video = mongoose.model('Video', VideoSchema)

PlaylistSchema = mongoose.Schema
        title: String,
        description: String,
        videos: [VideoSchema]

Playlist = mongoose.model('Playlist',PlaylistSchema)

module.exports = mongoose