module.exports = (container)->
    container.set 'players',container.share (c)->
        util = require 'util'
        _ = require 'lodash'
        players = {} 
        not_implemented_here=->throw "not implemented here!"
        
        ###
        	helps render video players
        ###
        class players.Base
            toJSON:->do not_implemented_here
            render:->do not_implemented_here
        
        class players.Youtube extends players.Base
            @canPlay=(video)->
                "youtube" is video.provider
        	
            constructor:(@video_id,@options={})->
                _.defaults(@options,{frameborder:0,height:480,width:640,allowfullscreen:"true"})
                @src = "//www.youtube.com/embed/#{@video_id}"
            
            toJSON:->
        	        src:@src
        	        width:@options.width
        	        height:@options.height
        	        frameborder:@options.frameborder
        	        allowfullscreen:@options.allowfullscreen

            toHTML:->
        	        data = @toJSON()
        	        """
        	        <iframe width="#{data.width}" 
                    height="#{data.height}" src="#{data.src}" 
                    frameborder="{data.frameborder}" 
                    #{if data.allowfullscreen then "allowfullscreen"}></iframe>
        	        """
        
        class players.Vimeo extends players.Base
            @canPlay=(video)->
                "vimeo" is video.provider
            constructor:(@_videoId,@_options={})->
                _.defaults(@_options,{width:640,height:480})
                @_provider="vimeo"
            toJSON:->
                id:@_videoId,
                width:@_options.width
                height:@_options.height
            toHTML:->
                data = @toJSON()
                """
                <iframe src="//player.vimeo.com/video/#{data.id}" 
                width="#{data.width}" height="#{data.height}" frameborder="0" 
                webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
                """
                
        class players.Dailymotion extends players.Base
            @canPlay=(video)->
                "dailymotion" is video.provider
            constructor:(@_videoId,@_options={})->
                _.defaults(@_options,{width:640,height:480})
            toJSON:->
                id:@_videoId,
                width:@_options.width
                height:@_options.height
            toHTML:->
                data = @toJSON()
                """
                    <iframe src="//www.dailymotion.com/embed/video/#{data.id}"
                    width="#{data.width}" height="#{data.height}" frameborder="0"
                    webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
                    """
        class players.PlayerFactory
        
            constructor:(@_players=[])->
        
            push:()->
                @_players.push(arguments...)
        
            pop:()->
                @_players.pop()
        
            remove:(player)->
                @_players.splice(@_players.indexOf(player),1)
            
            fromVideo:(video,options)->
                _Player = @_players.filter((_Player)->_Player.canPlay(video))[0]
                if _Player then new _Player(video.originalId,options)
        
        return players
