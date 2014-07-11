express = require 'express'
database = require './database'
players = require './players'
Video = database.model('Video')
Playlist = database.model('Playlist')
Category = database.model('Category')
async = require 'async'
forms = require "./forms"
q = require "q"
_ = require 'lodash'

###
# CONTROLLERS
###
controllers= {}

controllers.index = (req,res,next)-> #default page
    q.all([q.ninvoke(Video,'findPublicVideos'),Category.whereVideoExist(),Playlist.getLatest()])
    .spread((videos,categories,playlists)->
        res.render('index',{videos,categories,playlists}))
    .catch((err)->
        next(err))

controllers.videoById = (req,res,next)->
    q(Video.findSimilar(res.locals.video,{limit:8}))
    .then (videos)-> res.render('video',{videos:videos,player:new players.Youtube(res.locals.video.originalId)})
    .catch (err)-> next(_.extend(err,{status:500}))

###
    VIDEO CRUD
###
controllers.videoCreate = (req,res,next)->
    res.locals._csrf = req.csrfToken()
    if req.method is "POST" and req.body.url
        q().then -> q.ninvoke(Video,'fromUrl',req.body.url,{owner:req.user})
        .then (video)-> res.redirect('/video/'+video.id)
        .catch (err)-> res.render('/profile/video-create',{error:err})
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
    where = {title:if req.query.q then new RegExp(req.query.q,'i')}
    q.ninvoke(Video,'findPublicVideos', where)
    .then((videos)->res.render('search',{videos,q:req.query.q}))
    .catch((err)->next(_.extend(err,{status:500})))


###
    PLAYLIST OPERATIONS
###

# /profile/playlist
controllers.playlistList= (req,res,next)->
    q.ninvoke(Playlist,'findByOwnerId',req.user.id)
    .then((playlists)->res.render('profile/playlist-list',{playlists}))
    .catch((err)->next(_.extend(err,[status:500])))

controllers.playlistCreate = (req,res,next)->
    playlist = new Playlist()
    form = forms.Playlist()
    form.setModel(playlist)
    if req.method is "POST"
        form.bind(req.body)
        if form.validateSync()
            playlist.owner = req.user.id
            return playlist.save((err,playlist)->
                return next(_.extend(err,status:500)) if err
                res.redirect('/playlist/'+playlist.id)
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
# PLAYLIST
###

# /playlist/:playlistId/video/:videoId
controllers.playlistById = (req,res,next)->
    q().then ->
        playlist = res.locals.playlist
        video = _.find(playlist.videos,(v)->v.id==req.query.videoId) or playlist.getFirstVideo()
        return [q.ninvoke(Video,'populate',video,{path:"owner category"}),new players.Youtube(video.originalId),playlist]
    .spread (video,player,playlist)->
        res.render('playlist',{playlist,video,player})
    .done _.noop,(err)-> next(err)

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
# CATEGORIES
###

# /category/:categoryId
controllers.categoryById=(req,res,next)->
    q.all([Category.findById(req.params.categoryId).exec(),Video.find({category:req.params.categoryId}).exec(),Playlist.getLatest()])
    .spread((category,videos,playlists)-> res.render('index',{videos,category,playlists,pageTitle:"Latest Videos in #{category.title}"}))
    .catch((err)->next(err))
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
    q.all([q.ninvoke(Video,'findByOwnerId',req.user.id),q.ninvoke(Playlist,'findByOwnerId',req.user.id)])
    .spread((videos,playlists)->res.render('profile/index',{videos,playlists}))
    .catch((err)->next(_.extend(err,{status:500})))

module.exports=controllers
