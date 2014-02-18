"use strict"

express = require 'express'
pimple = require 'pimple'
util = require 'util'
path = require 'path'
flash = require 'connect-flash'
config = require './lib/config'
events = require 'events'
sessionStores = require './lib/session-stores'

container = new pimple
    port: process.env.PORT || 3000
    youtub_api_key: process.env.EXPRESS_VIDEO_YOUTUBE_API_KEY
    connection_string: process.env.EXPRESS_VIDEO_MONGODB_CONNECTION_STRING
    debug: if process.env.NODE_ENV == "production" then false else true

container.set "app", container.share ->
    app = express()
    middlewares = container.middlewares
    controllers = container.controllers
    app.configure ->
        app.engine('twig',container.swig.renderFile)
        app.set('view engine', 'twig')
        app.locals(container.locals)
        app.use(express.cookieParser("secret sentence"))
        app.use(express.session({store:container.sessionStore}))
        app.use(flash())
        app.use(express.bodyParser())
        app.use(container.passport.initialize())
        app.use(container.passport.session())
        # persistent session login
        app.use(express.static(path.join(__dirname, "..", "public")))
        app.use(express.favicon())
        app.use(express.compress())
        app.use(container.monolog.middleware())
        app.disable("verbose errors")

    app.configure 'development', ->
        app.use(express.logger("dev"))
        app.enable('verbose errors')


    app.configure 'testing', ->
        app.disable("verbose errors")

    app.map = container.mixins.map
    
    app.param('videoId',middlewares.video)

    app.map 
        use:[middlewares.user,middlewares.flash],
        "/api/video":
            use: middlewares.videoApi
        "/api/video.fromUrl": 
            post: controllers.videoFromUrl
        "/api/playlist":
            use: middlewares.playlistApi
        "/": 
            get:controllers.index
        "/video/:videoId":
            get:controllers.videoById
        "/profile":
            all:[middlewares.isLoggedIn,controllers.profile]
            "/video/new":
                all:[middlewares.isLoggedIn,middlewares.csrf,controllers.videoCreate]
            "/video":
                get:[middlewares.isLoggedIn,middlewares.csrf,controllers.videoList]
            "/video/:videoId/update":
                all:[middlewares.isLoggedIn,
                    middlewares.belongsToUser(container.Video,'video'),
                    middlewares.csrf,
                    controllers.videoUpdate]
            '/video/:videoId/remove':
                post:[middlewares.isLoggedIn,
                    middlewares.belongsToUser(container.Video,'video')
                    middlewares.csrf,
                    controllers.videoRemove]
        "/login":
            get:[middlewares.csrf,controllers.login]
            post:container.passport.authenticate('local-login',{
                successRedirect:'/profile',
                failureRedirect:'/login',
                failureFlash:true
                })
        "/signup":
            get:[middlewares.csrf,controllers.signup]
            post:[middlewares.csrf,controllers.signupPost,container.passport.authenticate('local-signup',{
                successRedirect:'/profile',
                failureRedirect:'/signup',
                failureFlash:true
            })]

        #erase user credentials
        "/logout":
            get:controllers.logout

    app.use(middlewares.notFound)
    app.use(middlewares.serverError)

    app.on 'error',(err)->
        container.mongolog.error(err)

    return app

container.set "locals", container.share ->
    title: "mpm.video"
    paginate: (array, length, start = 0)->
        divisions = Math.ceil(array.length / length)
        [start...divisions].map (i)->
            array.slice(i * length, i * length + length)

container.set "swig", container.share ->
    swig = require 'swig'
    swig.setDefaults {cache: 'memory'}
    return swig

container.set "db", container.share ->
    database = require './lib/database'
    database.set("debug", false) #container.debug 
    database.connect config.connection_string
    return database

container.set "User", container.share ->
    container.db.model('User')

container.set "Video", container.share ->
    container.db.model('Video')

container.set "Playlist", container.share ->
    container.db.model('Playlist')

container.set "Session",container.share ->
    container.db.model('Session')

container.set "sessionStore",container.share ->
    new sessionStores.MongooseSessionStore({},container.Session)

container.set "monolog", container.share ->
    monolog = require 'monolog'
    logger = new monolog.Logger("express logger")
    logger.addHandler(new monolog.handler.StreamHandler(__dirname + "/../temp/log.txt"))
    logger.middleware = (message = "debug")->
        init = false
        return (req, res, next)->
            if not init
                logger.addProcessor(new monolog.processor.ExpressProcessor(req.app))
                req.app.set('monolog', logger)
                init = true
            logger.debug("#{message} #{req.method} #{req.path} #{JSON.stringify(req.headers)}")
            next()

    return logger

container.set "passport", container.share ->
    passport = require 'passport'
    LocalStrategy = require('passport-local').Strategy
    User = container.User
    passport.serializeUser (user,done)->done(null,user.id)
    passport.deserializeUser (id,done)->User.findById(id,done)
    passport.use 'local-signup', new LocalStrategy({
        usernameField:'email',
        passwordField:'password',
        passReqToCallback:true
    },(req,email,password,done)->
        process.nextTick ->
            User.findOne 'local.email':email,(err,user)->
                if err  then done(err)
                if user
                    done(null,false,req.flash('signupMessage','That email is already taken'))
                else
                    newUser = new User()
                    newUser.username = req.body.username
                    newUser.local.email = email
                    newUser.local.password = newUser.generateHash(password)
                    newUser.save(done)
    )
    passport.use 'local-login',new LocalStrategy({
        usernameField:'email',
        passwordField:'password',
        passReqToCallback:true
    },(req,email,password,done)->
        User.findOne {'local.email':email},(err,user)->
            if err then return done(err)
            if user 
                if user.validPassword(password)
                    return done(null,user)
            return done(null,false,req.flash('loginMessage','Invalid credentials!'))
    )
    return passport

container.set "forms", container.share -> require './lib/forms'
container.set "middlewares", container.share -> require './lib/middlewares'
container.set "controllers", container.share -> require './lib/controllers'
container.set "mixins", container.share -> require './lib/mixins'

module.exports = container
