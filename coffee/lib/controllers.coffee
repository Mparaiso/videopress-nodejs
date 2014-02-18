"use strict"

express = require 'express'
database = require './database'
players = require './players'
Video = database.model('Video')
Playlist = database.model('Playlist')
async = require 'async'
forms = require "./forms"

controllers= exports 

###
    CONTROLLERS
###

controllers.index = (req,res,next)-> #default page
    Video.list((err,videos)->
        if err then next(err)
        else res.render('index',{videos}))

controllers.videoById = (req,res,next)->
    Video.findSimilar res.locals.video,{limit:8},(err,videos)->
        if err 
            err.status = 500 
            next(err)
        else 
            player = new players.Youtube(res.locals.video.originalId)
            res.render('video',{videos:videos,player:player.render()})
###
    VIDEO CRUD
###
controllers.videoCreate = (req,res,next)->
    res.locals._csrf = req.csrfToken()
    if req.method is "POST" and req.body.url
        async.auto({
                video:Video.fromUrl.bind(Video,req.body.url)
                setUser:['video',(next,result)->
                    video = result.video[0]
                    if req.user and req.user.id
                        video.owner = req.user.id
                        video.save(next)
                    else 
                        next()
            ]},(err,result)->
                if err 
                    res.render('profile/video-create',{error:err})
                else 
                    res.redirect('/video/'+result.video[0].id))
    else
        res.render('profile/video-create')

controllers.videoFromUrl = (req,res,next)->
    url = req.query.url
    if not url then  res.json(500,{error:"url query parameter not found"})
    else Video.fromUrl url,(err,result)->
        if err then res.json(500,{error:"video for url #{url} not found"}) 
        else res.json(result)

###
# /profile/video/videoId/update
# user updates a video
# requires middleware.video
###
controllers.videoUpdate = (req,res,next)->
    form = forms.Video()
    form.setModel(res.locals.video)
    if req.method is "POST"
        form.bind(req.body)
        if form.validateSync()
            return res.locals.video.save (err)->
                if err then err.status = 500 ; next(err)
                res.redirect('/video/'+req.params.videoId)
    res.render('profile/video-update',{form})

controllers.videoRemove = (req,res,next)->
    res.locals.video.remove (err)->
        if err then err.status = 500 ; next(err)
        else 
            req.flash('success','Video removed')
            res.redirect('/profile/video')
###
# /profile/video
###
controllers.videoList = (req,res)->
    Video.findByOwnerId(req.user.id)
        .exec (err,videos)->
            if err then next(err)
            else res.render('profile/video-list',{videos})

###
    ACCOUNTS
###

controllers.login = (req,res,next)->
    form = forms.Login(req.csrfToken())
    res.render('login',{form:form})

controllers.signup = (req,res)->
    _csrf = res.locals._csrf = req.csrfToken()
    form = forms.SignUp(_csrf)
    res.render('signup',{form:form})

controllers.signupPost = (req,res,next)->
    form = forms.SignUp(req.csrfToken())
    form.bind(req.body)
    if form.validateSync()
        req.body.password = req.body.password[0]
        next()
    else
        res.render('signup',{form})

controllers.logout = (req,res)-> 
    req.logout() 
    req.session.destroy(->res.redirect('/'))

# show current user profile
controllers.profile = (req,res)->
    Video.findByOwnerId req.user.id,(err,videos)->
        if err then app.get('monolog').error(err)
        res.render('profile/index',{videos})