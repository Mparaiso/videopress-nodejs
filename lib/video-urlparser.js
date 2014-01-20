"use strict";
var http = require("http")
    , util = require('util')
    , duration = require('mpm.duration')
    , _ = require('underscore')
    , https = require('https')
    , request = require('request');

/**
 * [VideoData description]
 * @param {String|Object} title | params : title or a param object with all constructor params
 * @param {String} description
 * @param {String} thumbnail
 * @param {String} duration
 * @param {String} publishedAt
 * @param {String} originalId
 * @param {String} provider
 * @param {String} meta
 */
var VideoData = function (title, description, thumbnail, duration, publishedAt, originalId, provider, meta) {
    var params = arguments[0];
    if (typeof params === 'object') {
        this.title = params.title;
        this.description = params.description;
        this.thumbnail = params.thumbnail;
        this.duration = params.duration;
        this.publishedAt = params.publishedAt;
        this.originalId = params.originalId;
        this.provider = params.provider;
        this.meta = params.meta;
    } else {
        this.title = title;
        this.description = description;
        this.thumbnail = thumbnail;
        this.duration = duration;
        this.publishedAt = publishedAt;
        this.originalId = originalId;
        this.provider = provider;
        this.meta = meta;
    }
};
/**
 * Provide access to a website video apiUrl
 * @constructor
 * @param {String} name Baseparser name
 */
var Baseparser = function (name) {
    this.name = name;
};
/**
 * get video data from video id
 * @param  {String}   id
 * @param  {Function} callback (err,data)=>{}
 * @return {Void}
 */
Baseparser.prototype.getVideoDataFromId = function (id, callback) {return;};

/**
 * get video id from url
 * @param  {String} url
 * @return {String}
 */
Baseparser.prototype.getIdFromUrl = function (url) {return;};
/**
 * validate url
 * @param  {String}  url
 * @return {Boolean}
 */
Baseparser.prototype.isValidUrl = function (url) {return;};
/**
 * Method to call to get data from video url;
 * @param url
 * @param callback
 * @returns {*}
 */
Baseparser.prototype.parse = function (url, callback) {
    return this.getVideoDataFromUrl(url, callback);
};
Baseparser.prototype.request = request;

/**
 * Parse a Youtube video Url to extract informations
 * @constructor
 * @param {string} apikey
 */
var YoutubeUrlParser = function (apikey) {
    Baseparser.call(this, "youtube");
    this.regexp = /((http|https):\/\/)?(www\.)?youtube\.com\/watch\?v=(\w+)/;
    this.setApiKey(apikey);
};
YoutubeUrlParser.prototype = Object.create(Baseparser.prototype);
YoutubeUrlParser.prototype.constructor = Baseparser;
YoutubeUrlParser.prototype.getApiKey = function () {
    return this._apiKey;
};
YoutubeUrlParser.prototype.setApiKey = function (apiKey) {
    this._apiKey = apiKey;
};
YoutubeUrlParser.prototype.getIdFromUrl = function (url) {
    if (this.isValidUrl(url)) {
        var match = url.match(this.regexp);
        return match[match.length - 1];
    }
};
YoutubeUrlParser.prototype.isValidUrl = function (url) {
    return this.regexp.test(url);
};
YoutubeUrlParser.prototype.getApiUrl = function (videoId, apiKey) {
    return "https://www.googleapis.com/youtube/v3/videos?id="
        + videoId
        + "&part=snippet,contentDetails&key="
        + apiKey;
};
YoutubeUrlParser.prototype.getVideoDataFromUrl = function (url, callback) {
    var id = this.getIdFromUrl(url);
    return this.getVideoDataFromId(id, callback);
};
YoutubeUrlParser.prototype.getVideoDataFromId = function (id, callback) {
    var options = {
        url: this.getApiUrl(id, this.getApiKey()), json: true
    };
    return this.request(options, function (err, clientResponse, jsonBody) {
        var item = jsonBody.items[0];
        console.log(jsonBody.items);
        if(item===undefined){
            return callback(new Error('Video with id '+id+' not found'));
        }
        var title = item.snippet.title,
            description = item.snippet.description,
            thumbnail = item.snippet.thumbnails.default.url,
            _duration = duration.parse(item.contentDetails.duration),
            publishedAt = new Date(item.snippet.publishedAt),
            originalId = item.id,
            provider = "youtube",
            meta = item;
        return callback(err, new VideoData(title, description, thumbnail, _duration, publishedAt, originalId, provider, meta));
    });
};

module.exports = {
        YoutubeUrlParser: YoutubeUrlParser
};