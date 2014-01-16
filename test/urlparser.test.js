/*jslint nomen:true,white:true,node:true,es5:true*/
/*global require,it,describe,beforeEach */

"use strict";
var assert = require('assert')
    , request = require('supertest')
    , lib = require('../lib')
    , config = lib.config
    , YoutubeUrlParser = lib.videoUrlParser.parsers.YoutubeUrlParser;

describe("urlparser", function () {
    var youtube_url = 'http://www.youtube.com/watch?v=7lCDEYXw3mM'
        , youtube_video_id = '7lCDEYXw3mM'
        , vimeo_url = "http://vimeo.com/56166857";

    describe('youtube provider', function () {
        beforeEach(function () {
            this.youtubeUrlParser = new YoutubeUrlParser(config.youtube_api_key);
        });
        it('should validate url', function () {
            assert(this.youtubeUrlParser.isValidUrl(youtube_url));
            assert.equal(this.youtubeUrlParser.isValidUrl(vimeo_url), false);
        });
        it('should find youtube video id', function () {
            assert.equal(this.youtubeUrlParser.getIdFromUrl(youtube_url), youtube_video_id);
            assert.equal(this.youtubeUrlParser.getIdFromUrl(vimeo_url), null);
        });
        it('should find youtube video datas', function (done) {
            assert.equal(typeof this.youtubeUrlParser.request, 'function');
            this.youtubeUrlParser.getVideoDataFromUrl(youtube_url, function (err, result) {
                assert.equal(result.originalId, youtube_video_id);
                assert.equal(err, null);
                done();
            });
        });
    });
});