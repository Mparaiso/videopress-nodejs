"use strict"

parsers = require './parsers'
async = require 'async'
bcrypt = require 'bcrypt-nodejs'
_= require 'lodash'

module.exports = (container)->
    container.set "videoParser",container.share (c)->
        youtubeVideoParser = new parsers.Youtube(c.config.youtube_apikey)
        vimeoVideoParser = new parsers.Vimeo(c.config.vimeo_access_token)
        videoParserChain = new parsers.Chain [youtubeVideoParser,vimeoVideoParser]
        return videoParserChain

    container.set 'mongoose', container.share (c)->
        require 'mongoose'

    container.set "db", container.share (c)->
        c.mongoose.set("debug", c.config.mongoose_debug)
        c.mongoose.connect(c.config.connection_string)
        return c.mongoose

    container.set "Category",container.share (c)->
        CategorySchema = c.db.Schema({
            title:{type:String,required:'title is required'},
            provider:{type:String,default:"youtube"},
            originalId:Number
        })
        ###
        # @return Promise<Array>
        # @TODO implement
        ###
        CategorySchema.statics.whereVideoExist = ->
            c.q.ninvoke(c.Video,'aggregate',[
                {$match:{category:{$exists:true}}},
                {$group:{_id:"$category",total:{$sum:1}}}
            ])
            .then((categories)->
                return Category.find({_id:{$in:_.pluck(categories,'_id')}}).exec()
            )
            
        CategorySchema.methods.toString = -> this.title
        
        Category = c.db.model('Category',CategorySchema)
        return Category
    
    container.set "Video", container.share (c)->
        VideoSchema = c.db.Schema
            url: {type: String},
            owner: {type: c.db.Schema.Types.ObjectId, ref: 'User'},
            title: {type:String,required:"title is required"},
            description: {type:String},
            private:{type:Boolean,default:false},
            originalCategoryId:Number,
            category:{type:c.db.Schema.Types.ObjectId,ref:'Category'},
            duration: Object,
            created_at:{type:Date,'default':Date.now},
            updated_at:{type:Date,'default':Date.now},
            publishedAt: { type: Date, 'default': Date.now},
            originalId: String,
            provider: String,
            thumbnail: String,
            meta: Object,
            viewCount:{type:Number,default:0}
        
        ### 
            create video from video url 
            if document already exist,return existing video
            @param url
            @param properties?
            @param {Function} callback
        ###
        VideoSchema.statics.fromUrl = (url,properties={})->
            c.q.ninvoke(c.videoParser,'parse',url)
            .then (data)->
                _.extend(data,properties)
                [c.q(Video.findOne({owner:data.owner,url:data.url}).exec()),data]
            .spread (video,data)->
                if video then video
                else Video.create(data)
                
        VideoSchema.statics.findByOwnerId = (id,cb)->
            query = this.find({owner:id}).select('title thumbnail created_at owner').sort({created_at:-1}).populate('owner')
            if cb then query.exec(cb) else c.q(query.exec())
        VideoSchema.statics.findByCategoryId = (id,cb)->
            query = this.find({category:id}).select('title thumbnail created_at owner').sort({created_at:-1}).populate('owner')
            if cb then query.exec(cb) else c.q(query.exec())
        
        VideoSchema.statics.list = (query,callback,q)->
            if query instanceof Function
                callback = query
                query = {}
            q = this.find(query)
            .select('title thumbnail created_at owner')
            .sort({created_at:-1})
            .populate('owner')
            if callback then q.exec(callback) else q
            
        VideoSchema.statics.findPublicVideos = (where={},callback,q)->
            if where instanceof Function
                callback = where
                where = {}
            where = _.extend(where,{private:false})
            q = this.find(where).limit(40).sort({updated_at:-1}).populate('owner')
            if callback
                q.exec(callback)
            else q
        
        VideoSchema.statics.persist = (video)->
            c.q(video.save())

        VideoSchema.methods.toString = ->
            this.title
        
        ###
         * find Similar 
         * @param  {Video}   video   
         * @param  {Object}   options  
         * @param  {Function} callback 
        ###
        VideoSchema.statics.findSimilar = (video,options={})->
            this.find({category:video.category,_id:{'$ne':video.id}},null,options).exec()
        
        VideoSchema.pre('save',(next)->
            this.updated_at=Date.now()
            if not this.category and this.originalCategoryId
                c.q(c.Category.findOne({originalId:this.originalCategoryId}).exec())
                .then ((category)=>this.category=category ; null)
                .catch -> next()
                .done -> next()
            else next()
        )
        
        Video = c.db.model('Video', VideoSchema)
        return Video

    container.set "Playlist", container.share (c)->
        PlaylistSchema = c.db.Schema
                title: {type:String,required:true},
                owner:{type:c.db.Schema.Types.ObjectId,ref:'User'}
                thumbnail:{type:String};
                description: String,
                videos: [{ref:'Video',type:c.db.Schema.Types.ObjectId}]
                video_urls:String
                private:{type:Boolean,default:false}
        
        PlaylistSchema.pre('save',(next)->
            ### 
             transform a string of video urls into video documents and add video ids to video field 
            ###
            self=this
            if typeof this.video_urls is "string"
                _urls = _.compact(this.video_urls.split(/[\s \n \r ,]+/))
                _props = if this.owner then {owner:this.owner} else {}
                c.q.all(_urls.map (url)-> c.Video.fromUrl(url,_props).catch (err)->c.logger.err err  )
                .then (videos)-> self.videos = c._(videos).compact().pluck('id').value() ; self.thumbnail = videos[0]?.thumbnail ; next() 
                .catch next
            else
                next()
        )
        PlaylistSchema.statics.getLatest = (limit=10,callback)->
            if limit instanceof Function
                callback=limit
                limit=10
            Playlist.find().sort({updated_at:-1}).limit(10).exec(callback)
        
        PlaylistSchema.statics.findByOwnerId = (id,callback,q)->
            q = this.find({owner:id}).populate('videos owner')
            if callback then q.exec(callback) else q
        PlaylistSchema.statics.persist = (playlist,options...)->
            c.q.ninvoke(playlist,'save',options...)
        PlaylistSchema.methods.toString=->
            this.title
        
        PlaylistSchema.methods.getFirstVideo=->
            this.videos[0]
        
        Playlist = c.db.model('Playlist',PlaylistSchema)
        return Playlist
    
    container.set "Session",container.share (c)->
        SessionSchema = c.db.Schema
            sid:String
            session:Object
        Session = c.db.model('Session',SessionSchema)
        return Session

    container.set 'User',container.share (c)->
        UserSchema = c.db.Schema
            roles:{type:Array,default:['member']}
            username:{type:String,required:"username is required"}
            isAccountNonExpired:{type:Boolean,default:true}
            isEnabled:{type:Boolean,default:true}
            isCredentialsNonExpired:{type:Boolean,default:true}
            isAccountNonLocked:{type:Boolean,default:true}
            created_at:{type:Date,default:Date.now,required:true}
            local:
                email:String
                password:String
            facebook:
                id:String
                token:String
                email:String
                name:String
            twitter:
                id:String
                token:String
                displayName:String
                username:String
            google:
                id:String
                token:String
                email:String
                name:String

        ### Hash generation ###
        UserSchema.methods.generateHash = (password)->
            bcrypt.hashSync(password,bcrypt.genSaltSync(8),null)
        ### check password ###
        UserSchema.methods.validPassword = (password)->
            bcrypt.compareSync(password,this.local.password)
        UserSchema.methods.toString = ->
            this.username.toString()
        
        User = c.db.model('User', UserSchema)
        return User



