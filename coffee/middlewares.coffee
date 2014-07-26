module.exports = (container)->
    container.set 'middlewares',container.share (c)->        
        Rest = require 'mpm.express.rest'
        q = require('q')
        
        ### 
        # MIDDLEWARES 
        # @namespace
        ###
        middlewares = {}
        
        ###
            Makes the csrf token mandatory
            add _csrf to res.locals and headers
        ###
        middlewares.csrf = (req,res,next)->
                (c.express.csrf())(req,res,(err)->
                    if err then next(err)
                    else
                        # add _csrf to template variables
                        res.locals._csrf = req.csrfToken()
                        # add _csrf to response headers
                        res.set('_csrf',res.locals._csrf)
                        next())
        # sets res.locals.video
        middlewares.video =(req,res,next,id)->
            c.Video.findById(id)
            .select('title private description duration thumbnail provider owner publishedAt originalId category categoryId')
            .populate('owner category')
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
        
        middlewares.playlist = (req,res,next,id)->
            c.Playlist.findById(id)
                .where({private:false})
                .populate('videos owner')
                .exec((err,playlist)->
                    if err then err.status= 500 ; next(err)
                    else if not playlist
                        err = new Error("Playlist with id #{id} not found")
                        err.status = 404
                        next(err)
                    else 
                        res.locals.playlist = playlist
                        next()
                )
        
        # list categories
        middlewares.categories=((req,res,next)->
            res.locals.container.Category.whereVideoExist()
            .then((categories)->res.locals.categories=categories;next() , 
            next))
        
        # check if a resource belongs to a user
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
        
        # sets req.locals.user and req.locals.isAuthenticated
        middlewares.user = (req,res,next)-> 
            if req.isAuthenticated()
                res.locals.isAuthenticated = true
                res.locals.user = req.user
            else
                delete res.locals.user
                delete res.locals.isAuthenticated
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
       
        ###
        # @TODO rethink apis
        middlewares.videoApi = do ->
            controller = new Rest.Controller(c.express(),{allow:['list','get']})
            controller.setAdapter(new Rest.adapter.MongooseAdapter(c.Video))
            controller.handle()
        
        middlewares.playlistApi = do ->
            controller = new Rest.Controller(c.express(),{allow:['list','get']})
            controller.setAdapter(new Rest.adapter.MongooseAdapter(c.Playlist))
            controller.handle()
        ###
        
        ###
        error handlers
        @see https://github.com/visionmedia/express/blob/master/examples/error-pages/index.js
        ###
        middlewares.error = (err, req, res,next)->
                console.error(err)
                switch String(err.status)
                    when '404'
                        res.render('404')
                    else
                        res.render('500')
        
        return middlewares
