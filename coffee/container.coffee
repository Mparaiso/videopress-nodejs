###
    Copyright © 2014 mparaiso <mparaiso@online.fr>. All Rights Reserved.
###

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
container.set 'roles',
    MEMBER:'member'
    MODERATOR:'moderator'
    ADMIN:'administrator'
    SUPER_ADMIN:"super_administrator"

container.set 'resources',
    VIDEO:'video'
    ROUTE:'route'
    PLAYLIST:'playlist'

container.set 'actions',
    LIST:'list'
    SEARCH:'search'
    CREATE:'create'
    DELETE:'delete'
    READ:'read'
    UPDATE:'update'
    
container.set 'routes',
    PUBLIC_INDEX:'/'
    PUBLIC_VIDEO_READ:'/video/:videoId'
    PUBLIC_PLAYLIST_READ:'/playlist/:playlistId'
    PUBLIC_CATEGORY_READ:'/category/:categoryId/:categoryTitle?'
    PROFILE_INDEX:'/profile'
    PROFILE_VIDEO_CREATE:'/profile/video/new'
    PROFILE_VIDEO_LIST:'/profile/video'
    PROFILE_VIDEO_ACTIONS:'/profile/video/action'
    PROFILE_VIDEO_UPDATE:'/profile/video/:videoId/update'
    PROFILE_VIDEO_DELETE:'/profile/video/:videoId/delete'
    PROFILE_PLAYLIST_LIST:'/profile/playlist'
    PROFILE_PLAYLIST_UPDATE:'/profile/playlist/:playlistId/update'
    PROFILE_PLAYLIST_DELETE:'/profile/playlist/:playlistId/delete'
    PROFILE_PLAYLIST_CREATE:'/profile/playlist/new'
    PROFILE_PLAYLIST_FROM_URL:'/profile/playlist/fromurl'
    LOGOUT:'/profile/logout'
    LOGIN:'/login'
    SIGNUP:'/signup'
    SEARCH:'/search'

container.set 'acl', container.share (c)->
    Acl = require('virgen-acl').Acl
    acl = new Acl
    acl.addRole(c.roles.MEMBER)
    acl.addRole(c.roles.MODERATOR,c.roles.MEMBER)
    acl.addRole(c.roles.ADMIN,c.roles.MODERATOR)
    acl.addRole(c.roles.SUPER_ADMIN,c.roles.ADMIN)
    acl.addResource(c.resources.VIDEO)
    acl.addResource(c.resources.ROUTE)
    acl.addResource(c.resources.PLAYLIST)
    # access rules (LIFO)
    acl.deny()
    acl.allow(c.roles.SUPER_ADMIN)
    acl.allow(c.roles.MEMBER,c.resources.ROUTE,[
        c.routes.PROFILE_INDEX
        c.routes.PROFILE_VIDEO_CREATE
        c.routes.PROFILE_VIDEO_LIST
        c.routes.PROFILE_VIDEO_ACTIONS
        c.routes.PROFILE_VIDEO_UPDATE
        c.routes.PROFILE_VIDEO_DELETE
        c.routes.PROFILE_PLAYLIST_LIST
        c.routes.PROFILE_PLAYLIST_UPDATE
        c.routes.PROFILE_PLAYLIST_DELETE
        c.routes.PROFILE_PLAYLIST_CREATE
        c.routes.PROFILE_PLAYLIST_FROM_URL
        c.routes.LOGOUT
    ])
    # guest allowed routes
    acl.allow(null,c.resources.ROUTE,[
        c.routes.PUBLIC_INDEX
        c.routes.PUBLIC_VIDEO_READ
        c.routes.PUBLIC_PLAYLIST_READ
        c.routes.PUBLIC_CATEGORY_READ
        c.routes.LOGIN
        c.routes.SIGNUP
        c.routes.SEARCH
    ])
    acl.deny(c.roles.MEMBER,c.resources.ROUTE,[
        c.routes.SIGNUP,
        c.routes.LOGIN
    ])
    return acl

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

container.set "errors", container.share ->
    NotFound:(message='not found')->
        e = new Error(message)
        e.status = 404
        return e

    Forbidden:(message='forbidden')->
        e = new Error(message)
        e.status = 403
        return e

    InternalServerError:(message='iternal server error')->
        e = new Error(message)
        e.status = 500
        return e


module.exports = container
