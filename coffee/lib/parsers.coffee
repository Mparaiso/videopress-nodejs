"use strict"
http = require("http")
util = require('util')
duration = require('mpm.duration')
_ = require('underscore')
https = require('https')
request = require('request')
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
 * @param {String} meta
###
class parsers.VideoData
 constructor:(@title, @description, @thumbnail, @duration, @publishedAt, @originalId, @provider, @meta)->
    if typeof @title == 'object'
        params = @title
        @title = params.title
        @description = params.description
        @thumbnail = params.thumbnail
        @duration = params.duration
        @publishedAt = params.publishedAt
        @originalId = params.originalId
        @provider = params.provider
        @meta = params.meta
###
 * Provide access to a website video apiUrl
 * @constructor
 * @param {String} name Baseparser name
###
class parsers.BaseVideo
    constructor: (@name)->
    ###
    * get video data from video id
    * @param  {String}   id
    * @param  {Function} callback (err,data)=>{}
    * @return {Void}
    ###
    getVideoDataFromId: (id, callback)->

    ###
    * get video id from url
    * @param  {String} url
    * @return {String}
    ###
    getIdFromUrl: (url)->
    ###
    * validate url
    * @param  {String}  url
    * @return {Boolean}
    ###
    isValidUrl: (url)->
    ###
     * Method to call to get data from video url
     * @param url
     * @param callback
     * @returns {*}
    ###
    parse: (url, callback)->this.getVideoDataFromUrl(url, callback)

    request:request

###
 * Parse a Youtube video Url to extract informations
 * @constructor
 * @param {string} apikey
###
class parsers.YoutubeVideo extends parsers.BaseVideo
    constructor: (apikey)->
        super("youtube")
        @regexp = /((http|https):\/\/)?(www\.)?youtube\.com\/watch\?v=(\w+)/
        @setApiKey(apikey)
    getApiKey:->this._apiKey
    setApiKey:(@_apiKey)->this
    getIdFromUrl:(url)->
        if this.isValidUrl(url)
            match = url.match(this.regexp)
            match[match.length - 1]
    isValidUrl:(url)->this.regexp.test(url)
    getApiUrl:(videoId, apiKey)->"https://www.googleapis.com/youtube/v3/videos?id=#{videoId}&part=snippet,contentDetails&key=#{apiKey}"
    getVideoDataFromUrl:(url, callback)->
        id = this.getIdFromUrl(url)
        @getVideoDataFromId(id,callback)
    getVideoDataFromId:(id, callback)->
        options = 
            url: this.getApiUrl(id, this.getApiKey())
            json: true
        @request options,(err, clientResponse, json)->
            item = json.items[0]
            if item==undefined 
                callback(new Error("Video with id #{id} not found"))
            else
                callback err,new parsers.VideoData 
                    title : item.snippet.title
                    description : item.snippet.description
                    thumbnail : item.snippet.thumbnails.default.url
                    _duration : duration.parse(item.contentDetails.duration)
                    publishedAt : new Date(item.snippet.publishedAt)
                    originalId : item.id
                    provider : "youtube"
                    meta : item

