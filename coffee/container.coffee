"use strict"

Rest = require 'mpm.express.rest'
express = require 'express'
Pimple = require 'pimple'
swig = require 'swig' 
mongoose = require 'mongoose'
mongolog = require 'monolog'
util = require 'util'
YoutubeVideo = require('./lib/parsers').YoutubeVideo

container = new Pimple
    port: process.env.PORT || 3000
    youtub_api_key:process.env.EXPRESS_VIDEO_YOUTUBE_API_KEY
    connection_string:process.env.EXPRESS_VIDEO_MONGODB_CONNECTION_STRING
    debug:if process.env.NODE_ENV == "production" then false else true

container.set "app",container.share ->
    app = express()

    app.configure ->
        app.use(express.json())
        app.engine('html',swig.renderFile)
        app.set('view engine','html')
        app.locals(container.locals)

    app.configure 'development',->
        app.use(express.logger())
        app.use(container.logger.middleware(app))

    app.configure 'testing',->
        container.set 'connection_string',process.env.EXPRESS_VIDEO_MONGODB_CONNECTION_STRING_TEST
    app.use('/api/video',container.routes.videoApi)
    app.post('/api/video.fromUrl',container.routes.fromUrl)
    app.use('/api/playlist',container.routes.playlistApi)
    app.get('/',container.routes.index)

container.set "locals",container.share ->
    title:"mpm.video"

###
    ROUTING
###
container.set "routes", container.share -> 
    routes = 
        videoApi : do ->
            controller = new Rest.Controller(express())
            controller.setAdapter(new Rest.adapter.MongooseAdapter(container.Video))
            controller.handle()
        playlistApi: do ->
            controller = new Rest.Controller(express())
            controller.setAdapter(new Rest.adapter.MongooseAdapter(container.Playlist))
            controller.handle()
        fromUrl:(req,res,next)->
            url = req.query.url
            if not url then  res.json(500,{error:"url query parameter not found"})
            else container.Video.fromUrl url,(err,result)->
                if err then res.json(500,{error:"video for url #{url} not found"}) 
                else res.json(result)
        index:(req,res)-> #default page
            res.end(container.app.locals.title)

###
    DATABASE
###
container.set "db", container.share ->
    mongoose.set("debug",container.debug)
    mongoose.connect(container.connection_string)
    return mongoose

container.set "UserSchema", container.share ->
    container.db.Schema(nickname: String)

container.set "User",container.share ->
    container.db.model('User', container.UserSchema)

container.set "VideoSchema",container.share ->
    VideoSchema = container.db.Schema
        url: {type: String},
        owner: {type: container.db.Schema.Types.ObjectId, ref: 'User'},
        title: String,
        description: String,
        duration: Object,
        publishedAt: { type: Date, default: Date.now},
        originalId: String,
        provider: String,
        thumbnail: String,
        meta: Object

    ### create video from video url ###
    VideoSchema.statics.fromUrl = (url, callback)->
        youtubeVideo = new YoutubeVideo(process.env.EXPRESS_VIDEO_YOUTUBE_API_KEY)
        if youtubeVideo.isValidUrl(url)
            youtubeVideo.getVideoDataFromUrl url, (err, res)->
                if err
                    return callback(new Error(util.format("Video with url %s not found", url)))
        
                video = new container.Video(res)
                video.save(callback)
        else
            callback(new Error(util.format("Video with url %s not found", url)))

    return VideoSchema

container.set "Video",container.share ->
    container.db.model('Video', container.VideoSchema)

container.set "PlaylistSchema",container.share ->
    container.db.Schema
        title: String,
        description: String,
        videos: [container.VideoSchema]

container.set "Playlist",container.share ->
    container.db.model('Playlist', container.PlaylistSchema)

###
    LOGGER
###
container.set "logger",container.share ->
    logger = new monolog.Logger("express logger")
    logger.addHandler(new monolog.handler.StreamHandler(__dirname + "/../temp/log.txt"))
    logger.middleware = (app, message="debug")->
        logger.addProcessor(new monolog.processor.ExpressProcessor(app))
        app.set('logger', logger)
        F =  (req, res, next)->
            logger.debug(message)
            next()
        F.logger = logger
        return F
    return logger

###
    LAUNCH APPLICATION
###
if not module.parent
    container.app.listen container.port,->
        console.log "listening on port #{container.port}"
else
    module.exports = container



