stores = exports 
express = require 'express'

###
    Store Session in a mongoose model 
###
class stores.MongooseSessionStore extends express.session.Store
        constructor:(options,@model)->
            super
        all:(callback)->
            @model.find((err,sessions)->
                if sessions then callback(null,sessions.map (s)->s.session)
                else callback(err,sessions))
        get:(sid,callback)->
            @model.findOne({sid},(err,session)->
                if session then callback(null,session.session)
                else callback(err,session))
        set:(sid,session,callback)->
            @model.findOneAndUpdate({sid},{session:session},{upsert:true})
            .exec(callback)
        destroy:(sid,callback)->
            @model.findOneAndRemove({sid},callback)
        length:(callback)->
            @model.count(callback)
        clear:(callback)->
            @model.remove(callback)
        toString:->"[object MongooseSessionStore]"

