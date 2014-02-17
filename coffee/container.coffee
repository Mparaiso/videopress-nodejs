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
forms = require './lib/forms'
events = require 'events'
sessionStores = require './lib/session-stores'

container = new pimple
    port: process.env.PORT || 3000
    youtub_api_key: process.env.EXPRESS_VIDEO_YOUTUBE_API_KEY
    connection_string: process.env.EXPRESS_VIDEO_MONGODB_CONNECTION_STRING
    debug: if process.env.NODE_ENV == "production" then false else true

container.set "app", container.share ->
    app = express()
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

    ###
    route map mixin
    mount routes with a single object
    @param routes
    @param prefix
    ###
    app.map = (routes, prefix = "")->
        for key,value of routes
            switch typeof value
                when "object"
                    if value instanceof Array #value is an array of functions
                        value.unshift(prefix)
                        this[key](value...)
                    else this.map(value, prefix + key) #value is a hash of value definitions
                else
                    this[key]([prefix, value]...) # value is a function , key is a verb or use
        return this

    app.map(container.routes.map)

    ###
        error handlers
        @see https://github.com/visionmedia/express/blob/master/examples/error-pages/index.js
    ###
    app.use (req, res)->
        res.status(404)
        res.render('404', {code: res.statusCode})
    app.use (err, req, res)->
        app.get('monolog').error(err)
        res.status(err.status || 500)
        res.render('500')

    return app

container.set "locals", container.share ->
    title: "mpm.video"
    paginate: (array, length, start = 0)->
        divisions = Math.ceil(array.length / length)
        [start...divisions].map (i)->
            array.slice(i * length, i * length + length)

container.set "swig", container.share ->
    swig.setDefaults {cache: 'memory'}
    return swig

container.set "routes", container.share ->
    routes.passport = container.passport
    return routes

container.set "db", container.share ->
    database.set("debug", container.debug)
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
                    newUser = new User
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

container.set "forms", forms
module.exports = container
