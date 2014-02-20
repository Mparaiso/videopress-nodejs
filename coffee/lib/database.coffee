"use strict"

mongoose = require 'mongoose'
parsers = require './parsers'
util = require 'util'
config = require './config'
async = require 'async'
bcrypt = require 'bcrypt-nodejs'
_= require 'underscore'

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
    isEnabled:{type:Boolean,default:true}
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
UserSchema.methods.toString = ->
    this.username.toString()

User = mongoose.model('User', UserSchema)

VideoSchema = mongoose.Schema
    url: {type: String},
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    title: String,
    description: String,
    private:{type:Boolean,default:false},
    categoryId:Number,
    duration: Object,
    created_at:{type:Date,'default':Date.now},
    updated_at:{type:Date,'default':Date.now},
    publishedAt: { type: Date, 'default': Date.now},
    originalId: String,
    provider: String,
    thumbnail: String,
    meta: Object,
    viewCount:{type:Number,default:0}

### create video from video url ###
VideoSchema.statics.fromUrl = (url, callback)->
    youtubeVideo = new YoutubeVideo(config.youtube_apikey)
    if youtubeVideo.isValidUrl(url)
        youtubeVideo.getVideoDataFromUrl url, (err, res)->
            if err then callback(new Error(util.format("Video with url %s not found", url)))
            else video = new Video(res) ; video.save(callback)
    else callback(new Error(util.format("Video with url %s not found", url)))

VideoSchema.statics.findByOwnerId = (id,cb)->
    q = this.find({owner:id})
    if cb then q.exec(cb) else q

VideoSchema.statics.list = (query,callback)->
    if query instanceof Function
        callback = query
        query = {}
    q = this.find(query)
    .select('title thumbnail created_at owner')
    .sort({created_at:-1})
    .populate('owner')
    if callback then q.exec(callback) else q
    
VideoSchema.statics.findPublicVideos = (where={},callback)->
    if where instanceof Function
        callback = where
        where = {}
    where = _.extend(where,{private:false})
    q = this.find(where).limit(40)
    if callback
        q.exec(callback)
    else q

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