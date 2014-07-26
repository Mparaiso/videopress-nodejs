/*jslint nomen:true,white:true,node:true,es5:true*/
/*global require,it,describe,beforeEach */
"use strict";
var assert = require('assert'),
    request = require('supertest'),
    c = require('./../app'),
    youtube_api_key = process.env.EXPRESS_VIDEO_YOUTUBE_API_KEY;

describe("YoutubeVideo", function() {
    var youtube_url = 'http://www.youtube.com/watch?v=7lCDEYXw3mM',
        youtube_video_id = '7lCDEYXw3mM',
        youtubeUrls = ['http://www.youtube.com/watch?v=rFxcsgVwmTM',
            'http://www.youtube.com/watch?v=7lCDEYXw3mM',
            "http://www.youtube.com/watch?v=F3wpq-i150c",
            "http://www.youtube.com/watch?v=-0YGTX-26WE"
        ];

    beforeEach(function  () {
        this.videoParser = c.videoParser ;
    })
    youtubeUrls.forEach(function(url) {
        it('should validate url : ' + url, function() {
            assert(this.videoParser.isValidUrl(url), url + " should be a valid url");
        });
    });
    it('should find youtube video datas', function(done) {
        this.videoParser.parse(youtube_url, function(err, result) {
            assert.equal(result.originalId, youtube_video_id);
            assert.equal(err, null);
            done();
        });
    });
});
