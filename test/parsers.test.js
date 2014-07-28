/*jslint nomen:true,white:true,node:true,es5:true*/
/*global require,it,describe,beforeEach */
"use strict";
var assert = require('assert'),
    request = require('supertest'),
    c = require('./../app'),
    youtube_api_key = process.env.EXPRESS_VIDEO_YOUTUBE_API_KEY;

describe("parsers.Chain", function() {
    var youtube_url = 'http://www.youtube.com/watch?v=7lCDEYXw3mM',
        youtube_video_id = '7lCDEYXw3mM',
        youtubeUrls = ['http://www.youtube.com/watch?v=rFxcsgVwmTM',
            'http://www.youtube.com/watch?v=7lCDEYXw3mM',
            "http://www.youtube.com/watch?v=F3wpq-i150c",
            "http://www.youtube.com/watch?v=-0YGTX-26WE",
            "http://youtu.be/bbww4vmB88k",
            "https://youtu.be/bbww4vmB88k",
            "youtu.be/bbww4vmB88k",
            "http://youtu.be/_g6Z_AMCylg?list=UUv-fy9iUJMxpa-1yHP6LIOQ",
            "http://www.dailymotion.com/video/xvtlja",
            "https://www.dailymotion.com/video/xvtlja",
            "www.dailymotion.com/video/xvtlja_tutoriel-video-php-paypal-express-checkout_lifestyle",
            "dailymotion.com/video/xvtlja_tutoriel-video-php-paypal-express-checkout_lifestyle"
        ],
        invalidUrls = [
            "foo"
        ];

    beforeEach(function  () {
        this.videoParser = c.videoParser ;
    })
    youtubeUrls.forEach(function(url) {
        it('should be valid url : ' + url, function() {
            assert(this.videoParser.isValidUrl(url), url + " should be a valid url");
        });
    });
    invalidUrls.forEach(function(url){
        it('shouldnt be a valid url : '+url,function(){
            assert.equal(false,this.videoParser.isValidUrl(url));
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
