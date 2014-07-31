###
    Copyright © 2014 mparaiso <mparaiso@online.fr>. All Rights Reserved.
###
module.exports = (container)->

    container.set "app", container.share (c)->
        init = false
        middlewares = c.middlewares
        controllers = c.controllers

        app = c.express()
        app.disable 'x-powered-by'
        app.enable 'trust proxy'

        app.engine('twig', c.swig.renderFile)
        app.set('view engine', 'twig')
        app.locals(c.locals)

        app.use (req, res, next)->
            # init models
            if not init
                c.Session
                c.Category
                c.User
                c.Video
                c.Playlist
                init = true
            next()
    
        app.use(c.express.static(c.path.join(__dirname, "..", "public"), c.config.static))
        app.use(c.express.cookieParser(c.config.session.secret))
        app.use(c.express.session(c._.extend({}, c.config.session, {store: c.sessionStore})))
        app.use require('connect-flash')()
        app.use c.express.bodyParser()
        app.use c.passport.initialize()
        app.use c.passport.session()
        app.use c.express.compress()
        app.use c.express.csrf()

        if c.debug
            app.enable('verbose errors') unless process.env.NODE_ENV is "testing"
            app.use(c.express.logger("dev"))
        else
            app.disable("verbose errors")
            app.on 'error', (err)->
                c.logger.error({error:err,message:err.message})

        app.enable('verbose errors')

        app.use (req,res,next)->
            #set various params on res.locals
            if req.isAuthenticated()
                res.locals.isAuthenticated = true
                res.locals.user = req.user

            res.locals.originalUrl = req.originalUrl
            res.locals.config = c.config
            res.locals._csrf = req.csrfToken()
            res.locals.flash = req.flash()
            next()

        app.use middlewares.requestLogger # log every regquests
        app.use middlewares.firewall #use acl to check if current user can access route

        app.param 'videoId', middlewares.video
        app.param 'playlistId', middlewares.playlist

        ### Routes ###
        app.get  c.routes.PUBLIC_INDEX,controllers.index
        app.get  c.routes.PUBLIC_VIDEO_READ,controllers.videoById
        app.get  c.routes.PUBLIC_PLAYLIST_READ,controllers.playlistById
        app.get  c.routes.PUBLIC_CATEGORY_READ,middlewares.categories, controllers.categoryById
        app.get  c.routes.PROFILE_INDEX, controllers.profile.index
        app.all  c.routes.PROFILE_VIDEO_CREATE,controllers.videoCreate
        app.all  c.routes.PROFILE_VIDEO_LIST,controllers.videoList
        app.post c.routes.PROFILE_VIDEO_ACTIONS,controllers.profile.video.actions
        app.all  c.routes.PROFILE_VIDEO_UPDATE,middlewares.belongsToUser(c.Video, 'video'),controllers.videoUpdate
        app.post c.routes.PROFILE_VIDEO_DELETE,middlewares.belongsToUser(c.Video, 'video'),controllers.videoDelete
        app.get  c.routes.PROFILE_PLAYLIST_LIST, controllers.playlistList
        app.all  c.routes.PROFILE_PLAYLIST_UPDATE,middlewares.belongsToUser(c.Playlist, 'playlist'),controllers.profile.playlist.update
        app.post c.routes.PROFILE_PLAYLIST_DELETE,middlewares.belongsToUser(c.Playlist, 'playlist'),controllers.playlistRemove
        app.all  c.routes.PROFILE_PLAYLIST_CREATE, controllers.playlistCreate
        app.all  c.routes.PROFILE_PLAYLIST_FROM_URL,controllers.profile.playlist.fromUrl
        app.get  c.routes.LOGOUT, controllers.logout #erase user credentials
        app.get  c.routes.LOGIN,controllers.login
        app.post c.routes.LOGIN, c.passport.authenticate('local-login', {successRedirect: '/profile',failureRedirect: '/login',failureFlash: true})
        app.get  c.routes.SIGNUP, controllers.signup
        app.post c.routes.SIGNUP,controllers.signupPost, c.passport.authenticate('local-signup', {successRedirect: '/profile',failureRedirect: '/signup',failureFlash: true})
        app.get  c.routes.SEARCH, controllers.videoSearch #search videos by title
    
        if not c.debug
            #middleware for errors if not debug
            app.get '/*', (req, res, next)->
                next(new c.errors.NotFound("page not found"))
    
            app.use middlewares.error
    

        return app