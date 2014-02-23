"use strict"

express = require 'express'
database = require './database'
players = require './players'
Video = database.model('Video')
Playlist = database.model('Playlist')
async = require 'async'
forms = require "./forms"
_ = require 'underscore'
controllers= exports 

###
    CONTROLLERS
###

controllers.index = (req,res,next)-> #default page
    Video.findPublicVideos((err,videos)->
        if err then next(err)
        else res.render('index',{videos}))

controllers.videoById = (req,res,next)->
    Video.findSimilar res.locals.video,{limit:8},(err,videos)->
        if err 
            err.status = 500 
            next(err)
        else 
            player = (new players.Youtube(res.locals.video.originalId)).toHTML()
            res.render('video',{videos:videos,player})
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
/search
###
controllers.videoSearch = (req,res,next)->
    where = {}
    if req.query.q 
        where.title = new RegExp(req.query.q,'i')
    Video.findPublicVideos where , (err,videos)->
        if err 
            err.status = 500 
            next(err)
        else
            res.render('search',{videos,q:req.query.q})

###
/profile/playlist
###
controllers.playlistList= (req,res,next)->
    Playlist.findByOwnerId(req.user.id,(err,playlists)->
        if err 
            err.status = 500
            next(err)
        else
            res.render('profile/playlist-list',{playlists})
    )
controllers.playlistCreate = (req,res,next)->
    playlist = new Playlist()
    form = forms.Playlist()
    form.setModel(playlist)
    if req.method is "POST"
        form.bind(req.body)
        if form.validateSync()
            playlist.owner = req.user.id
            playlist.save((err,playlist)->
                if err then err.status = 500 ; next(err)
                else res.redirect('/playlist/'+playlist.id)
            )
    res.render('profile/playlist-create',{form})
controllers.playlistUpdate= (req,res)->
    res.send(200,'todo implement')
controllers.playlistRemove= (req,res)->
    res.send(200,'todo','implement')
###
# /playlist/:playlistId/video/:videoId
###
controllers.playlistById = (req,res,next)->
    playlist = res.locals.playlist
    video = _.find(playlist.videos,(v)->v.id==req.query.videoId) or playlist.videos[0]
    if video
        player = (new players.Youtube(video.originalId)).toHTML()
    res.render('playlist',{playlist,video,player})
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
            console.log(form.getData().private);
            console.log(res.locals.video.private);
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
controllers.profile = (req,res,ext)->
    async.parallel({videos:Video.findByOwnerId.bind(Video,req.user.id)
    ,playlists:Playlist.findByOwnerId.bind(Playlist,req.user.id)}
    ,(err,results)->(
            if err 
                err.status = 500
                next(err)
            else 
                res.render('profile/index',{videos:results.videos,playlists:results.playlists})
        )
    )
    
