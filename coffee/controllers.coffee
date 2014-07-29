module.exports = (container)->     
     container.set 'controllers', container.share (c)->
        async = require 'async'
        q = c.q
        _ = c._
        
        ###
        # CONTROLLERS
        ###
        controllers= {}
       
        controllers.index = (req,res,next)-> #default page
            offset = if not ( isNaN( +req.query.offset ) or typeof +req.query.offset isnt "number" ) then +req.query.offset else 0 
            skip =  offset  * c.item_per_page
            q.all([c.Video.findPublicVideos(null,null,null,skip),c.Category.whereVideoExist(),c.Playlist.getLatest()])
            .spread((videos,categories,playlists)->
                res.render('index',{videos,categories,playlists,item_per_page:c.item_per_page,item_count:videos.length,offset}))
            .catch((err)->
                next(err))
        
        controllers.videoById = (req,res,next)->
            q(c.Video.findSimilar(res.locals.video,{limit:8}))
            .then (videos)-> res.render('video',{videos:videos,player:c.playerFactory.fromVideo(res.locals.video)})
            .catch (err)-> next(_.extend(err,{status:500}))
        
        ###
            PLAYLIST OPERATIONS
        ###
        
        # /profile/playlist
        controllers.playlistList= (req,res,next)->
            q.ninvoke(c.Playlist,'findByOwnerId',req.user.id)
            .then((playlists)->res.render('profile/playlist-list',{playlists}))
            .catch((err)->next(_.extend(err,[status:500])))
        
        controllers.playlistCreate = (req,res,next)->
            q(new c.Playlist())
            .then (playlist)->
                form = c.forms.Playlist().setModel(playlist)
                if req.method is "POST" and form.bind(req.body) and form.validateSync()
                    playlist.owner = req.user.id
                    c.Playlist.persist(playlist)
                    .then(-> res.redirect('/playlist/'+playlist.id))
                else res.render('profile/playlist-create',{form})
            .catch next
        
        ###
        # /profile/playlist/:playlistId/update
        ###
        controllers.playlistUpdate= (req,res,next)->
            q(res.locals.playlist)
            .then (playlist)->
                form = c.forms.Playlist().setModel(playlist)
                if req.method is "POST" and form.bind(req.body) and form.validateSync()
                    c.Playlist.persist(playlist)
                    .then -> res.redirect('/playlist/'.concat(playlist.id))
                else res.render('profile/playlist-update',{form,playlist})
            .catch next
        ###
        # /profile/playlist/:playlistId/delete
        ###
        controllers.playlistRemove = (req,res,next)->
            redirect = req.body._redirect or '/profile/playlist'
            q.ninvoke(res.locals.playlist,'remove')
            .then( (->res.redirect(redirect)) ,next)
        ###
        # PLAYLIST
        ###
        
        # /playlist/:playlistId/video/:videoId
        controllers.playlistById = (req,res,next)->
            q().then ->
                playlist = res.locals.playlist
                video = _.find(playlist.videos,(v)->v.id==req.query.videoId) or playlist.getFirstVideo()
                if video
                    [q.ninvoke(c.Video,'populate',video,{path:"owner category"}),c.playerFactory.fromVideo(video),playlist]
                else
                    [null,null,playlist]
            .spread (video,player,playlist)->
                res.render('playlist',{playlist,video,player})
            .done _.noop,(err)-> next(err)

        ###
        # VIDEO 
        ###
        controllers.videoCreate = (req,res,next)->
            res.locals._csrf = req.csrfToken()
            q.all([c.Category.find().exec(),{}])
            .spread (categories,model)->
                form = c.forms.VideoCreate(categories).setModel(model)
                if req.method is 'POST' and form.bind(req.body) and form.validateSync()
                    c.Video.fromUrl(model.url,{owner:req.user,category:model.category})
                    .then (video)-> res.redirect('/video/'+video.id)
                else res.render('profile/video-create',{form})
            .catch next
        
        controllers.videoSearch = (req,res,next)->
            query = if req.query.q then new RegExp()
            query.compile(req.query.q,'i')
            q(c.Video.findPublicVideos({description:query}))
            .then((videos)->res.render('search',{videos,q:req.query.q}))
            .catch((err)->next(_.extend(err,{status:500})))
               
        ###
        # /profile/video/videoId/update
        # user updates a video
        # requires middleware.video
        ###
        controllers.videoUpdate = (req,res,next)->
            q(c.Category.find().exec())
            .then (categories)->
                form = c.forms.Video(categories)
                form.setModel(res.locals.video)
                if req.method is "POST" and form.bind(req.body) and form.validateSync()
                    c.Video.persist(res.locals.video)
                    .then -> res.redirect('/video/'+req.params.videoId)
                else res.render('profile/video-update',{form})
            .catch next
        ###
        # /profile/videoRemove/:videoId/remove
        ###
        controllers.videoRemove = (req,res,next)->
            res.locals.video.remove (err)->
                if err then err.status = 500 ; next(err)
                else 
                    req.flash('success','video removed')
                    res.redirect('/profile/video')
        ###
        # /profile/video
        ###
        controllers.videoList = (req,res,next)->
            c.Video.findByOwnerId(req.user.id)
            .then (videos)-> res.render('profile/video-list',{videos})
            .catch next
        ###
        # CATEGORIES
        ###
        
        # /category/:categoryId
        controllers.categoryById=(req,res,next)->
            offset = if isNaN(+req.query.offset) or typeof +req.query.offset isnt "number" then 0 else +req.query.offset
            skip = offset* c.item_per_page
            q.all([c.Category.findById(req.params.categoryId).exec(),c.Video.findPublicVideos({category:req.params.categoryId},null,c.item_per_page,skip),c.Playlist.getLatest()])
            .spread((category,videos,playlists)-> res.render('index',{videos,category,playlists,pageTitle:"Latest videos in #{category.title}",offset,item_count:videos.length,item_per_page:c.item_per_page}))
            .catch((err)->next(err))

        ###
            ACCOUNTS
        ###
        
        controllers.login = (req,res,next)->
            form = c.forms.Login(req.csrfToken())
            res.render('login',{form:form})
        
        controllers.signup = (req,res)->
            _csrf = res.locals._csrf = req.csrfToken()
            form = c.forms.SignUp(_csrf)
            res.render('signup',{form:form})
        
        controllers.signupPost = (req,res,next)->
            form = c.forms.SignUp(req.csrfToken())
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
            res.locals._redirect = req.originalUrl
            q.all([q.ninvoke(c.Video,'findByOwnerId',req.user.id),q.ninvoke(c.Playlist,'findByOwnerId',req.user.id)])
            .spread((videos,playlists)->res.render('profile/index',{videos,playlists}))
            .catch((err)->next(_.extend(err,{status:500})))
        
        return controllers
