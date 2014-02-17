Rest = require 'mpm.express.rest'
express = require 'express'
database = require './database'
players = require './players'
Video = database.model('Video')
Playlist = database.model('Playlist')
async = require 'async'
forms = require "./forms"
csrf = express.csrf()

routes = exports

### SOME MIDDLEWARES ###
user = (req,res,next)-> res.locals.user = req.user ; next()
### route middleware to check user status ###
isLoggedIn = (req,res,next)->
    if req.isAuthenticated() then do next else res.redirect('/login')

cache = (req, res, next)-> # basic caching
    if req.method is "GET" and req.app.get('env') is "production"
        res.header('Cache-Control', "max-age=#{120}")
        res.header('X-Powered-By', 'mparaiso mparaiso@online.fr')
    next()

validateSignupForm = (req,res,next)->
    form = forms.SignUp(req.csrfToken())
    form.bind(req.body)
    if form.validateSync()
        console.log('form is valid')
        req.body.password = req.body.password[0]
        next()
    else
        console.log('form is not valid')
        res.render('signup',{form:form})
#set flash local variable
flash = (req,res,next)->
    res.locals.flash = req.flash()
    next()

###
 A map of routes
###
routes._getMap = ->
    use:[user,flash],
    #video api
    "/api/video":
        use: do ->
            controller = new Rest.Controller(express())
            controller.setAdapter(new Rest.adapter.MongooseAdapter(Video))
            controller.handle()
    #create resource from url
    "/api/video.fromUrl":
        post:(req,res,next)->
            url = req.query.url
            if not url then  res.json(500,{error:"url query parameter not found"})
            else Video.fromUrl url,(err,result)->
                if err then res.json(500,{error:"video for url #{url} not found"}) 
                else res.json(result)
    #playlist api 
    "/api/playlist":
        use: do ->
            controller = new Rest.Controller(express())
            controller.setAdapter(new Rest.adapter.MongooseAdapter(Playlist))
            controller.handle()
    ### index page ###
    "/": 
        get:[cache,(req,res,next)-> #default page
            Video.find().select('title thumbnail created_at owner').sort({created_at:-1}).exec (err,videos)->
                if err then next(err)
                else res.render('index',{videos})]
    ### get video by id ###           
    "/video/:id":
        get:[cache,(req,res,next)->
            async.auto 
                video: (next)->Video.findOne({_id:req.params.id}).exec(next)
                videos:['video',(next,res)->
                    if not res.video then err= new Error('Video not found');err.status= 404;next(err) #no video found
                    else Video.findSimilar(res.video,{limit:8},next)]
            ,(err,result)->
                if err then res.status(err.status||500);next(err) #error
                else if result.video 
                    player = new players.Youtube(result.video.originalId)
                    res.render('video',{video:result.video,videos:result.videos,player:player.render()})
                else
                    res.status(404)
                    next()]
    #user accounts
    "/login":
        get:[csrf,(req,res,next)->
            form = forms.Login(req.csrfToken())
            res.render('login',{form:form})]
        post:this.passport.authenticate('local-login',{
            successRedirect:'/profile',
            failureRedirect:'/login',
            failureFlash:true
            })
    "/signup":
        get:[csrf,(req,res)->
            _csrf = req.csrfToken()
            form = forms.SignUp(_csrf)
            res.render('signup',{form:form})]
        post:[csrf,validateSignupForm,@passport.authenticate('local-signup',{
            successRedirect:'/profile',
            failureRedirect:'/signup',
            failureFlash:true
        })]
    "/profile":
        get: [isLoggedIn,(req,res)->res.render('profile')]
    #erase user credentials
    "/logout":
        get:(req,res)-> req.logout() ; res.redirect('/')


Object.defineProperty routes,'map',
    get:->this._getMap()

Object.defineProperty routes,'passport',
    get:->this._passport
    set:(p)->this._passport=p





