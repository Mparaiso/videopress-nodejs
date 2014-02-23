util = require 'util'
_ = require "underscore"
players = exports

not_implemented_here=->throw "not implemented here!"

###
	helps render video players
###
class players.Base
	canRenderUrl:(url)->do not_implemented_here
	toJSON:->do not_implemented_here
	render:->do not_implemented_here

class players.Youtube
	defaultOptions:
		allowfullscreen:"true"
		width:640
		height:480
		frameborder:0
	
	constructor:(@video_id,@options={})->
		@options = _.extend({},@defaultOptions,@options)
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
		<iframe width="#{data.width}" height="#{data.height}" src="#{data.src}" frameborder="{data.frameborder}" #{if data.allowfullscreen then "allowfullscreen"}></iframe>
		"""
	canRenderUrl:->true
