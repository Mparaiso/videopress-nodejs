"use strict"
duration = require('mpm.duration')
request = require('request')
querystring=require('querystring')
url=require('url')
parsers =  exports

###
 * VideoData
 * @param {String|Object} title | params : title or a param object with all constructor params
 * @param {String} description
 * @param {String} thumbnail
 * @param {String} duration
 * @param {String} publishedAt
 * @param {String} originalId
 * @param {String} provider
 * @param {Number} categoryId
 * @param {String} meta
###
class parsers.VideoData
 constructor:(@title, @description, @thumbnail, @duration, @publishedAt, @originalId, @provider,@originalCategoryId, @meta)->
    if typeof @title == 'object'
        {@title,@description,@thumbnail,@duration,@publishedAt,@originalId,@originalCategoryId,@provider,@meta,@url}=@title


class parsers.Base
    ###
     * Provide access to a website video apiUrl
     * @constructor
     * @param {String} name Baseparser name
    ###
    constructor:->
    ###
    * validate url
    * @param  {String}  url
    * @return {Boolean}
    ###
    isValidUrl: (url)-> throw "Must be implemented in a sub class"
    ###
     * Method to call to get data from video url
     * @async
     * @param url
     * @param callback
     * @returns {*}
    ###
    parse: (url, callback)-> throw "Must be implemented in a sub class"

    _request:request
    _notValidUrl:(url,name="*")->new Error("#{url} is not a valid #{name} url")
    toString:-> '[object parsers.Base]'

class parsers.Vimeo extends parsers.Base
    constructor:(@_access_token)->
        @_regexp = /^((http|https):\/\/)?vimeo\.com\/(\w+)/i
        @_name = "vimeo"
    isValidUrl:(url)-> url.match(@_regexp)
    parse:(url,callback)->
        self=this
        if  @isValidUrl(url) 
            match = url.match(@_regexp)
            id = match.pop()
            options = 
                url : "https://api.vimeo.com/videos/#{id}"
                headers:{
                    "Authorization" : "Bearer #{@_access_token}"
                }
                json:true
            @_request options,(error,response,body)->
                if body and body.uri
                    video =  new parsers.VideoData
                        url:body.link
                        title: body.name
                        description: body.description
                        originalId:id
                        duration: do ->
                            d  = new duration.Duration()
                            d.seconds = body.duration
                            return d
                        thumbnail: body.pictures[4].link
                        publishedAt: body.created_time
                        provider:self._name
                        meta:body
                        categoryId:null
                    callback(null,video)
                else callback(error)
        else callback(@_notValidUrl(url,@_name))

class parsers.Youtube extends parsers.Base
    ###
    # @param  {String} apikey Youtube api key
    ###
    constructor: (apikey)->
        super("youtube")
        @regexp = /((http|https):\/\/)?(www\.)?youtube\.com\/watch\?v=([a-z A-Z 0-9 \- _]+)/
        @setApiKey(apikey)
    parse:(url,callback)-> @_getVideoDataFromUrl(url, callback)
    ###get api key###
    getApiKey:->this._apiKey
    ###set api key###
    setApiKey:(@_apiKey)->this
    ###extract id from url ###
    _getIdFromUrl:(url)->
        if this.isValidUrl(url)
            match = url.match(this.regexp)
            match[match.length - 1]
    ###can url  be handled by parser###
    isValidUrl:(url)->this.regexp.test(url)
    ###get api url###
    getApiUrl:(videoId, apiKey)->"https://www.googleapis.com/youtube/v3/videos?id=#{videoId}&part=snippet,contentDetails&key=#{apiKey}"
    ###get videodata from url###
    _getVideoDataFromUrl:(url, callback)->
        id = @_getIdFromUrl(url)
        @_getVideoDataFromId(id,callback,url)
    ###get videodata from id###
    _getVideoDataFromId:(id, callback,url="")->
        options = 
            url: this.getApiUrl(id, this.getApiKey())
            json: true
        @_request options,(err, clientResponse, json)->
            item = json.items[0]
            if item==undefined 
                callback(new Error("Video with id #{id} not found"))
            else
                callback err,new parsers.VideoData 
                    url: url
                    title : item.snippet.title
                    description : item.snippet.description
                    thumbnail : item.snippet.thumbnails.medium.url
                    duration : duration.parse(item.contentDetails.duration)
                    publishedAt : new Date(item.snippet.publishedAt)
                    originalId : item.id
                    originalCategoryId: item.snippet.categoryId
                    provider : "youtube"
                    meta : item

class parsers.YoutubeShort extends parsers.Youtube
    constructor:->
        super
        @regexp = /(?:(?:http|https):\/\/)?youtu\.be\/([\d \w _ -]+)/i

    _getIdFromUrl:(url)-> url.match(@regexp).pop()

class parsers.Dailymotion extends parsers.Base
    constructor:->
        @_regexp = /(?:https?\:\/\/)?(?:(?:www\.)?dailymotion\.com\/video\/)([\w \- \_ ]+)/i
    isValidUrl:(url)->url.match(@_regexp)
    parse:(url,callback)->
        if @isValidUrl(url)
            _id = url.match(@_regexp).pop()
            _options = {
                json:true
                method:"GET"
                url:"https://api.dailymotion.com/video/#{_id}?fields=title,created_time,description,duration%2Cduration_formatted%2Cid%2Cowner%2Cpublished%2Cthumbnail_240_url%2Ctype%2Curl"
            }
            @_request _options,(err,response,body)->
                if err then callback(err) else
                    callback(null,{
                        title:body.title
                        description:body.description
                        url:body.url
                        publishedAt:body.created_time
                        meta:body
                        originalId:_id
                        thumbnail:body.thumbnail_240_url
                        provider:"dailymotion"
                        duration:do ->
                            d  = new duration.Duration()
                            d.seconds = body.duration
                            return d
                    })

        else
            callback(new Error("#{url} is not a valid dailymotion url"))

class parsers.YoutubePlaylist extends parsers.Base

    ###*
    * @param {String} api_key
    * @param {Object} promise
    * @param {Object} underscore
    ###
    constructor:(@api_key,@q,@_)->

    isValidUrl:(urlString)->
        url.parse(urlString).host && url.parse(urlString).host.match(/^((http|https):\/\/)?(www\.)?(youtu\.be|youtube)/i)

    parse:(urlString,callback)->
        _id=null
        @q(@isValidUrl(urlString))
        .then (isValidUrl)=>
            if not isValidUrl then new parsers.NotValidYoutubePlaylistUrlError else
                _id = querystring.parse(url.parse(urlString).query).list
                @q.nfcall(request,{json:true,url:"https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=#{_id}&key=#{@api_key}"})
        .spread (response,body)=> [@q.nfcall(request,{json:true,url:"https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=#{_id}&key=#{@api_key}"}),@_(body.items).map((item)->{meta:item,originalId:item.snippet.resourceId.videoId,provider:"youtube",title:item.snippet.title,description:item.snippet.description,publishedAt:new Date(item.snippet.publishedAt),thumbnail:item.snippet.thumbnails.medium.url}).value()]
        .spread (response,videos)=> callback(null,@_(response[1].items[0].snippet).pick(['title','description']).extend({videos,originalId:_id}).value())
        .catch callback


###
# Chain of responsability , allows getting videos from multiple video apis
###
class parsers.Chain extends parsers.Base
    constructor:(@_parsers=[])->

    push:()->  @_parsers.push(arguments...)

    pop:()-> @_parsers.pop(arguments...)

    remove:(parser)-> @_parsers.splice(@_parsers.indexOf(parser),1)

    isValidUrl:(url)-> @_parsers.some (parser)-> parser.isValidUrl(url)

    parse:(url,callback)->
        parser = @_find(url)
        if not parser then callback(new Error("Url #{url} is not supported among parsers"))
        else parser.parse(url,callback)

    _find:(url)-> @_parsers.filter((parser)-> parser.isValidUrl(url))[0]




class parsers.NotValidYoutubePlaylistUrlError extends Error
    message:'not a valid youtube playlist'