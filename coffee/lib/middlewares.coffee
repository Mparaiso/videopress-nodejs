"use strict"

forms = require './forms'
Rest = require 'mpm.express.rest'
express = require 'express'
database = require './database'
Video = database.model('Video')
Playlist = database.model('Playlist')

middlewares = exports

### 
    MIDDLEWARES 
###

###
    Makes the csrf token mandatory
    add _csrf to res.locals and headers
###
middlewares.csrf = do ->
    csrf = express.csrf()
    (req,res,next)->
        csrf(req,res,(err)->
            if err then next err
            else 
                res.locals._csrf = req.csrfToken()
                res.set('_csrf',res.locals._csrf)
                do next)
# sets res.locals.video
middlewares.video = (req,res,next,id)->
    Video.findById(id)
    .select('title description duration thumbnail owner originalId categoryId')
    .populate('owner')
    .exec (err,video)->
        if err 
            err.status = 500 
            next(err)
        else if not video 
            err = new Error('Video not found')
            err.status = 404
            next(err)
        else 
            res.locals.video = video 
            next()

# a resource belongs to a user
middlewares.belongsToUser = (model,param)->
    (req,res,next)->
        model.findOne({_id:res.locals[param].id,owner:req.user.id})
        .exec (err,res)->
            if err 
                err.status = 403
                next(err)
            else if not res
                err = new Error("Access to resource #{param} for #{req.user} forbidden")
                next(err)
            else next()

# sets req.locals.user
middlewares.user = (req,res,next)-> 
    res.locals.user = req.user
    next()
# check if user is authenticated
middlewares.isLoggedIn = (req,res,next)->
    if req.isAuthenticated() then next() else res.redirect('/login')
# cache pages
middlewares.cache = (req, res, next)-> # basic caching
    if req.method is "GET" and req.app.get('env') is "production"
        res.header('Cache-Control', "max-age=#{5}")
        res.header('X-Powered-By', 'mparaiso mparaiso@online.fr')
    next()

#set flash local variable
middlewares.flash = (req,res,next)->
    res.locals.flash = req.flash()
    next()

middlewares.videoApi = do ->
    controller = new Rest.Controller(express())
    controller.setAdapter(new Rest.adapter.MongooseAdapter(Video))
    controller.handle()

middlewares.playlistApi = do ->
    controller = new Rest.Controller(express())
    controller.setAdapter(new Rest.adapter.MongooseAdapter(Playlist))
    controller.handle()

###
error handlers
@see https://github.com/visionmedia/express/blob/master/examples/error-pages/index.js
###
middlewares.notFound = (req, res)->
        res.status(404)
        res.render('404', {code: res.statusCode})

middlewares.serverError = (err, req, res,next)->
        req.app.get('monolog').error(err)
        res.status(err.status || 500)
        res.render('500')