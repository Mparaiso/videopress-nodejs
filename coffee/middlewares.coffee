###
    Copyright © 2014 mparaiso <mparaiso@online.fr>. All Rights Reserved.
###
module.exports = (container)->
    container.set 'middlewares',container.share (c)->        
        q = c.q
        _ = c._
        
        ### 
        # MIDDLEWARES 
        # @namespace
        ###
        middlewares = {}

        # sets res.locals.video
        middlewares.video =(req,res,next,id)->
            c.Video.findOneById(id)
            .then (video)->
                if not video
                    err = new Error('Video not found')
                    err.status = 404
                    err
                else 
                    res.locals.video = video
                    next()
            .catch next

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
            c.Category.whereVideoExist()
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

        # cache pages
        middlewares.cache = (req, res, next)-> # basic caching
            if req.method is "GET" and req.app.get('env') is "production"
                res.header('Cache-Control', "max-age=#{1000*60}")
                res.header('X-Powered-By', 'mparaiso mparaiso@online.fr')
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
                c.logger.error(err)
                switch err.status
                    when 404
                        res.status(404)
                        res.render('404')
                    else
                        res.status(500)
                        res.render('500')

        middlewares.requestLogger = (req, res, next)->
            # log every request/response
            res.once 'finish', ->
                message = {request: _.pick(req,['headers', 'trailers', 'method', 'url', 'statusCode', 'ip', 'port', 'user', 'error',"err",'cookies','session']), response: _.pick(res, ['statusCode', 'trailers', 'headers', 'error', "err"])}
                if res.statusCode >= 400
                    container.logger.error(message)
                else
                    container.logger.info(message)
            next()

        middlewares.firewall =(req,res,next)->
            # test current route against acl
            {path} = req.app._router.match(req.method,req.originalUrl) or {}
            c.acl.query (req.isAuthenticated() and req.user),c.resources.ROUTE,path,(err,isAllowed)->
                if isAllowed is true then next()
                else if not req.isAuthenticated()
                    res.redirect('/login')
                else next(err or (path and c.errors.Forbidden("Forbidden : User '#{req.user}' with role '#{req.user.role}' tried to access #{req.originalUrl}")) or c.errors.NotFound("url #{req.originalUrl} not found "))

        return middlewares
