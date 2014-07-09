"use strict"

mongoose = require 'mongoose'
parsers = require './parsers'
util = require 'util'
config = require './config'
async = require 'async'
bcrypt = require 'bcrypt-nodejs'
_= require 'lodash'
q =require 'q'

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
    title: {type:String,required:"title is required"},
    description: {type:String},
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

### 
    create video from video url 
    if document already exist,return existing video
    @param url
    @param properties?
    @param {Function} callback
###
VideoSchema.statics.fromUrl = (url,properties={}, callback)->
    if arguments.length ==2 and properties instanceof Function
        callback=properties
        properties={}
    youtubeVideo = new YoutubeVideo(config.youtube_apikey)
    if youtubeVideo.isValidUrl(url)
        return youtubeVideo.getVideoDataFromUrl(url,(err,data)->
            if err then callback(err) else
                _.extend(data,properties)
                Video.findOneAndUpdate(data,data,{upsert:true},(err,video)->
                    if err then callback(err) else callback(null,video)
                )
        )
    else
        callback(new Error(util.format("Video with url %s not found", url)))
           
        
VideoSchema.statics.findByOwnerId = (id,cb)->
    query = this.find({owner:id})
    if cb then query.exec(cb) else query

VideoSchema.statics.list = (query,callback,q)->
    if query instanceof Function
        callback = query
        query = {}
    q = this.find(query)
    .select('title thumbnail created_at owner')
    .sort({created_at:-1})
    .populate('owner')
    if callback then q.exec(callback) else q
    
VideoSchema.statics.findPublicVideos = (where={},callback,q)->
    if where instanceof Function
        callback = where
        where = {}
    where = _.extend(where,{private:false})
    q = this.find(where).limit(40).sort({created_at:-1}).populate('owner')
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
        title: {type:String,required:true},
        owner:{type:mongoose.Schema.Types.ObjectId,ref:'User'}
        thumbnail:{type:String};
        description: String,
        videos: [{ref:'Video',type:mongoose.Schema.Types.ObjectId}]
        video_urls:String
        private:{type:Boolean,default:false}

PlaylistSchema.pre('save',(next)->
    ### transform a list of video urls into video documents and add video ids to video field ###
    if typeof this.video_urls is "string"
        _urls = _.compact(this.video_urls.split(/[\s \n \r ,]+/))
        _props = if this.owner then {owner:this.owner} else {}
        async.map(_urls,
            (url,next)=>Video.fromUrl(url,_props,(err,video)->console.warn(err);next(null,video)),
            ((err,videos=[])=>
                this.videos = videos
                this.thumbnail = videos[0]?.thumbnail
                next())
        )
    else
        next()
)

PlaylistSchema.statics.findByOwnerId = (id,callback)->
    q = this.find({owner:id}).populate('videos owner')
    if callback then q.exec(callback) else q

PlaylistSchema.methods.toString=->
    this.title

PlaylistSchema.methods.getFirstVideo=->
    this.videos[0]

Playlist = mongoose.model('Playlist',PlaylistSchema)

module.exports = mongoose
