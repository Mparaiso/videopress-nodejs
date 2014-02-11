/*jslint nomen:true,white:true,node:true,es5:true*/
/*global require,it,describe,beforeEach */
"use strict";
require('source-map-support').install();
var assert = require('assert'),
    request = require('supertest'),
    parsers = require('../js/lib/parsers'),
    YoutubeVideo = parsers.YoutubeVideo,
    youtube_api_key = process.env.EXPRESS_VIDEO_YOUTUBE_API_KEY;

describe("YoutubeVideo", function() {
    var youtube_url = 'http://www.youtube.com/watch?v=7lCDEYXw3mM',
        youtube_video_id = '7lCDEYXw3mM';

    beforeEach(function() {
        this.YoutubeVideo = new YoutubeVideo(youtube_api_key);
        this.youtubeUrls = ['http://www.youtube.com/watch?v=rFxcsgVwmTM', 'http://www.youtube.com/watch?v=7lCDEYXw3mM'];
    });

    it('has an api key', function() {
        assert(this.YoutubeVideo.getApiKey());
    });
    it('should validate url', function() {
        this.youtubeUrls.forEach(function(url) {
            assert(this.YoutubeVideo.isValidUrl(url), url + " should be a valid url");
        }, this);
    });
    it('should find youtube video datas', function(done) {
        this.YoutubeVideo.parse(youtube_url, function(err, result) {
            assert.equal(result.originalId, youtube_video_id);
            assert.equal(err, null);
            done();
        });
    });
});