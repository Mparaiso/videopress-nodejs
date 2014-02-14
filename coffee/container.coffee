"use strict"

express = require 'express'
pimple = require 'pimple'
swig = require 'swig' 
monolog = require 'monolog'
util = require 'util'
database = require './lib/database'
routes = require './lib/routes'
path = require 'path'
passport = require 'passport'
flash = require 'connect-flash'
config = require './lib/config'

container = pimple
    port: process.env.PORT || 3000
    youtub_api_key:process.env.EXPRESS_VIDEO_YOUTUBE_API_KEY
    connection_string:process.env.EXPRESS_VIDEO_MONGODB_CONNECTION_STRING
    debug:if process.env.NODE_ENV == "production" then false else true

container.set "app",container.share ->
    app = express()
    app.configure ->
        app.engine('html',renderFile = container.swig.renderFile)
        app.engine('twig',renderFile)
        app.set('view engine','html')
        app.locals(container.locals)
        app.use(express.cookieParser())
        app.use(express.bodyParser())
        app.use(express.static(path.join(__dirname,"..","public")))
        #app.use(express.json())
        app.use(express.favicon())
        app.disable("verbose errors")
    app.configure 'development',->
        app.use(express.logger("dev"))
        app.use(container.monolog.middleware())
        app.use(express.session({secret:config.session_secret}))
        app.use(passport.initialize())
        app.use(passport.session()) # persistent session login
        app.use(flash())
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
                    if value instanceof Array #value is an array of functions
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
        app.get('monolog').error(err)
        res.status(err.status||500)
        res.render('500')

    return app

.set "locals",container.share ->
    title:"mpm.video"
    paginate:(array,length,start=0)->
        divisions = Math.ceil(array.length/length)
        [start...divisions].map (i)->
            array.slice(i*length,i*length+length)
        
.set "swig",container.share ->
    swig.setDefaults {cache:'memory'}
    return swig

.set "routes", container.share -> routes

.set "db", container.share ->
    database.set("debug",container.debug)
    return database

.set "User",container.share ->
    container.db.model('User')

.set "Video",container.share ->
    container.db.model('Video')

.set "Playlist",container.share ->
    container.db.model('Playlist')

.set "monolog",container.share ->
    logger = new monolog.Logger("express logger")
    logger.addHandler(new monolog.handler.StreamHandler(__dirname + "/../temp/log.txt"))
    logger.middleware = (message="debug")->
        init = false
        (req, res, next)->
            if not init
                logger.addProcessor(new monolog.processor.ExpressProcessor(req.app))
                req.app.set('monolog',logger)
                init = true
            logger.debug("#{message} #{req.method} #{req.path}")
            next()

    return logger

module.exports = container
