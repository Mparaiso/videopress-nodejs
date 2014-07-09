express = require 'express'
database = require './database'
players = require './players'
Video = database.model('Video')
Playlist = database.model('Playlist')
async = require 'async'
forms = require "./forms"
q = require "q"
_ = require 'lodash'

###
# CONTROLLERS
###
controllers= {}

controllers.index = (req,res,next)-> #default page
    Video.findPublicVideos((err,videos)->
        if err then next(err)
        else res.render('index',{videos}))

controllers.videoById = (req,res,next)->
    Video.findSimilar res.locals.video,{limit:8},(err,videos)->
        if err then (err.status = 500) and next(err)
        else
            player = new players.Youtube(res.locals.video.originalId)
            res.render('video',{videos:videos,player:player})
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
###
    PLAYLIST OPERATIONS
###
controllers.playlistCreate = (req,res,next)->
    playlist = new Playlist()
    form = forms.Playlist()
    form.setModel(playlist)
    if req.method is "POST"
        form.bind(req.body)
        if form.validateSync()
            playlist.owner = req.user.id
            return playlist.save((err,playlist)->
                if err 
                    err.status = 500 ; next(err)
                else res.redirect('/playlist/'+playlist.id)
            )
    res.render('profile/playlist-create',{form})

###
# /profile/playlist/:playlistId/update
###
controllers.playlistUpdate= (req,res,next)->
    playlist=res.locals.playlist
    form = res.locals.container.forms.Playlist()
    form.setModel(playlist)
    if req.method is "POST"
        form.bind(req.body)
        if form.validateSync()
            return playlist.save((err,playlist)->
                if err then next(err) else res.redirect('/playlist/'.concat(playlist.id))
            )
    res.render('profile/playlist-update',{form,playlist})
###
# /profile/playlist/:playlistId/delete
###
controllers.playlistRemove = (req,res,next)->
    q.ninvoke(res.locals.playlist,'remove')
    .then( (->res.redirect('/playlist')) ,next)
###
# /playlist/:playlistId/video/:videoId
###
controllers.playlistById = (req,res,next)->
    playlist = res.locals.playlist
    video = _.find(playlist.videos,(v)->v.id==req.query.videoId) or playlist.getFirstVideo()
    if video then player = new players.Youtube(video.originalId)
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
            return res.locals.video.save (err)->
                if err then err.status = 500 ; next(err)
                res.redirect('/video/'+req.params.videoId)
    res.render('profile/video-update',{form})
###
# /profile/videoRemove/:videoId/remove
###
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
    

module.exports=controllers
