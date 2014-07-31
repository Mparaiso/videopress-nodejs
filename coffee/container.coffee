"use strict"

Pimple = require 'pimple'

container = new Pimple
    port: process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3000,
    ip: process.env.OPENSHIFT_NODEJS_IP,
    youtub_api_key: process.env.EXPRESS_VIDEO_YOUTUBE_API_KEY,
    connection_string: process.env.EXPRESS_VIDEO_MONGODB_CONNECTION_STRING,
    debug: if process.env.NODE_ENV == "production" then false else true
    item_per_page: 26

# service providers
container.register require './database'
container.register require './controllers'
container.register require './middlewares'
container.register require './forms'
container.register require './players'
container.register require './validation'
container.register require './app'

# node modules

container.set "parsers", container.share -> require './parsers'

container.set "config", container.share -> require './config'

container.set "express", container.share -> require 'express'

container.set '_', container.share -> require 'lodash'

container.set 'path',container.share -> require 'path'

container.set 'q', container.share (c)->
    q = require 'q'
    if c.debug
        q.longStackSupport = true
    return q
container.set 'acl', container.share (c)->
    Acl = require('virgen-acl')
    acl = new Acl

container.set "locals", container.share ->
    title: "videopress",
    logopath: "/images/video-big.png",
    paginate: (array, length, start = 0)->
        divisions = Math.ceil(array.length / length)
        [start...divisions].map (i)->
            array.slice(i * length, i * length + length)

container.set "swig", container.share (c)->
    swig = require 'swig'
    swig.setDefaults({cache: if c.debug then false else "memory"})
    return swig

container.set "sessionStore", container.share ->
    sessionStores = require './session-stores'
    new sessionStores.MongooseSessionStore({}, container.Session)

container.set "videoParser", container.share (c)->
    youtubeVideoParser = new c.parsers.Youtube(c.config.youtube_apikey)
    youtubeShortParser = new c.parsers.YoutubeShort(c.config.youtube_apikey)
    vimeoVideoParser = new c.parsers.Vimeo(c.config.vimeo_access_token)
    dailymotionParser = new c.parsers.Dailymotion()
    videoParserChain = new c.parsers.Chain [youtubeVideoParser, vimeoVideoParser, dailymotionParser, youtubeShortParser]
    return videoParserChain

container.set "playlistParser", container.share (c)->
    new c.parsers.Chain [new c.parsers.YoutubePlaylist(c.config.youtube_apikey, c.q, c._)]

container.set "passport", container.share ->
    passport = require 'passport'
    LocalStrategy = require('passport-local').Strategy
    User = container.User
    passport.serializeUser (user, done)->
        done(null, user.id)
    passport.deserializeUser (id, done)->
        User.findById(id, done)
    passport.use 'local-signup', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        }, (req, email, password, done)->
        process.nextTick ->
            User.findOne {'local.email': email}, (err, user)->
                if err  then done(err)
                if user
                    done(null, false, req.flash('signupMessage', 'That email is already taken'))
                else
                    newUser = new User()
                    newUser.username = req.body.username
                    newUser.local.email = email
                    newUser.local.password = newUser.generateHash(password)
                    newUser.save(done)
    )
    passport.use 'local-login', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        }, (req, email, password, done)->
        User.findOne {'local.email': email}, (err, user)->
            if err then return done(err)
            if user
                if user.validPassword(password)
                    return done(null, user)
            return done(null, false, req.flash('loginMessage', 'Invalid credentials!'))
    )
    return passport

container.set "playerFactory", container.share (c)->
    new c.players.PlayerFactory [c.players.Youtube, c.players.Vimeo, c.players.Dailymotion]

container.set "errors", container.share ->
    {
    NotFound: class extends Error
        constructor: ->
            super
            @status = 404
    Forbidden: class extends Error
        constructor: ->
            super
            @status = 500
    }

container.set "monolog", container.share ->
    require 'monolog'

container.set "logger", container.share (c)->
    monolog = c.monolog
    Logger = monolog.Logger
    logger = new Logger("express logger")
    logger.addHandler(new monolog.handler.StreamHandler(__dirname + "/../temp/log.txt", Logger.DEBUG))
    logger.addHandler(new monolog.handler.ConsoleLogHandler(Logger.INFO))
    logger.addHandler(new c.MongooseLogHandler(c.Log, Logger.INFO))
    return logger

container.set "MongooseLogHandler", container.share (c)->
    class MongooseLogHandler extends c.monolog.handler.AbstractProcessingHandler

        # @param  {MongoClient} @mongodb
        # @param  {String} @collection
        # @param  {Number} level=100
        # @param  {Boolean} bubble=true
        constructor: (@mongooseModel, level = 100, bubble = true)->
            super(level, bubble)
        ###
         * @param record
         * @param {Function} cb
        ###
        write: (record, cb)->
            @mongooseModel.create(record, (err, res)=>
                cb(err, res, record, this))
            @bubble

module.exports = container
