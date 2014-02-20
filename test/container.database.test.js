/*global describe,it,before,beforeEach*/
"use strict";
describe("container.db", function() {
    /*global describe,it,beforeEach,before*/
    var assert = require('assert'),
        container = require('../app'),
        Video = container.Video,
        Playlist = container.Playlist;

    before(function(done) {
        Video.remove(function() {
            Playlist.remove(done);
        });
    });

    describe('Video', function() {
        beforeEach(function() {
            this.url = "http://www.youtube.com/watch?v=fwyZqyGEPNk";
            this.data = {
                title: 'Build an API with Node.js, Mongodb and Cloud Foundry',
                url: 'http://www.youtube.com/watch?v=3AKaGShTHpo'
            };
            this.video = new Video(this.data);
            Video.remove();
        });
        describe("#fromUrl", function() {
            it('should create a video from a url', function(done) {
                Video.fromUrl(this.url, function(err, result) {
                    assert(!err);
                    assert(result.title);
                    done();
                });
            });
        });
        it('should save a video', function(done) {
            this.video.save(done);
        });
        describe("#findPublicVideos", function() {
            it('should find public videos', function(done) {
                Video.findPublicVideos(done);
            });
               it('should find public videos with where parameter', function(done) {
                Video.findPublicVideos({foo:/bar/},done);
            });
        });

    });
    describe('Playlist', function() {
        beforeEach(function(done) {
            this.data = {
                title: "playlisttitle"
            };
            this.playlist = new Playlist(this.data);
            Playlist.remove(done);
        });

        it('should save', function(done) {
            this.playlist.save(done);
        });
    });
});