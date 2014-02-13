"use strict"

express = require 'express'
Pimple = require 'pimple'
swig = require 'swig' 
monolog = require 'monolog'
util = require 'util'
database = require './lib/database'
routes = require './lib/routes'
path = require 'path'
CONFIG_PATH = path.join __dirname,"..","config"

container = new Pimple
    port: process.env.PORT || 3000
    youtub_api_key:process.env.EXPRESS_VIDEO_YOUTUBE_API_KEY
    connection_string:process.env.EXPRESS_VIDEO_MONGODB_CONNECTION_STRING
    debug:if process.env.NODE_ENV == "production" then false else true

container.set "app",container.share ->
    app = express()
    
    app.configure ->
        app.engine('html',container.swig.renderFile)
        app.set('view engine','html')
        app.locals(container.locals)
        app.use(express.static(path.join(__dirname,"..","public")))
        app.use(express.json())
        app.use(express.favicon())
        app.disable("verbose errors")

    app.configure 'development',->
        app.use(express.logger("dev"))
        app.use(container.logger.middleware(app))
        app.enable('verbose errors')

    app.configure 'testing',->
        container.set 'connection_string',process.env.EXPRESS_VIDEO_MONGODB_CONNECTION_STRING_TEST

    ###
    route map mixin
    mount routes with a single object
    @param routes
    @param prefix
    ###
    app.map = (routes, prefix="")->
        for key,value of routes 
            switch typeof value
                when "object" 
                    if (value instanceof Array and value.every (r)-> r instanceof Function) #value is an array of functions
                        value.unshift(prefix)
                        this[key](value...)
                    else this.map(value, prefix + key) #value is a hash of value definitions
                when "function"
                    this[key]([prefix,value]...) # value is a controller , key is a verb or use
        return this
    ###
        basic caching
    ###
    app.use (req,res,next)->
        if req.method is "GET"
            res.header('Cache-Control',"max-age=#{120}")
            res.header('X-Powered-By','mparaiso mparaiso@online.fr')
        next()

    app.map container.routes

    ### 
        error handlers 
        @see https://github.com/visionmedia/express/blob/master/examples/error-pages/index.js
    ###
    app.use (req,res,next)->
        res.status(404)
        res.render('404',{code:res.statusCode})
    app.use (err,req,res,next)->
        res.status(err.status||500)
        res.render('500')

    return app

container.set "locals",container.share ->
    title:"mpm.video"
    paginate:(array,length,start=0)->
        divisions = Math.ceil(array.length/length)
        [start...divisions].map (i)->
            array.slice(i*length,i*length+length)
        
###
    TEMPLATE
###
container.set "swig",container.share ->
    swig.setDefaults {cache:'memory'}
    return swig

    
###
    CONFIG
###
container.set "config", container.share -> require CONFIG_PATH
###
    ROUTING
###
container.set "routes", container.share -> routes

###
    DATABASE
###
container.set "db", container.share ->
    database.set("debug",container.debug)
    return database

container.set "User",container.share ->
    container.db.model('User')

container.set "Video",container.share ->
    container.db.model('Video')

container.set "Playlist",container.share ->
    container.db.model('Playlist')

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
            logger.debug("#{message} #{req.method} #{req.path}")
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



