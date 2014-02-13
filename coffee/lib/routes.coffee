Rest = require 'mpm.express.rest'
express = require 'express'
database = require './database'
Video = database.model('Video')
Playlist = database.model('Playlist')

routes = 
    "/api":
        "/video":
            use: do ->
                controller = new Rest.Controller(express())
                controller.setAdapter(new Rest.adapter.MongooseAdapter(Video))
                controller.handle()
            ".fromUrl":
                post:(req,res,next)->
                    url = req.query.url
                    if not url then  res.json(500,{error:"url query parameter not found"})
                    else Video.fromUrl url,(err,result)->
                        if err then res.json(500,{error:"video for url #{url} not found"}) 
                        else res.json(result)
        "/playlist":
            use: do ->
                controller = new Rest.Controller(express())
                controller.setAdapter(new Rest.adapter.MongooseAdapter(Playlist))
                controller.handle()
    "/":
        get:(req,res,next)-> #default page
            Video.find().select('title thumbnail created_at owner').sort({created_at:-1}).exec (err,videos)->
                if err then next(err)
                else res.render('index',{videos})
    "/video/:id":
        get:(req,res,next)->
            Video.findOne {_id:req.params.id},(err,video)->
                if err then res.status(500);next(err) #error
                else if video then res.render('video',{video})
                else res.status(404);next() #not found


module.exports = routes

