/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global describe,it,before,beforeEach*/
"use strict";

describe("container.db", function() {
    /*global describe,it,beforeEach,before*/
    var assert = require('assert'),
    container = require('../app'),
    Video = container.Video,
    Playlist = container.Playlist,
    User = container.User,
    q=container.q;

    beforeEach(function(done) {
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
        });
        describe("#fromUrl", function() {
            it('should create a video from a url', function(done) {
                Video.fromUrl(this.url).catch(done)
                .then(function(){done()});
            });
            it('should save a video', function(done) {
                this.video.save(done);
            });
            it('shouldnt be inserted multiple times for the same user',function(done){
                var self=this;
                q(User.create({username:"foo"}))
                .then(function(user){return [user,Video.fromUrl(self.url,{owner:user})];})
                .spread(function(user,video){return Video.fromUrl(self.url,{owner:user});})
                .then(function(){return q(Video.find().exec())})
                .catch(done)
                .done(function(videos){
                    assert.equal(1,videos.length);
                    done();
                })
            });
            describe("#findPublicVideos", function() {
                it('should find public videos', function(done) {
                    Video.findPublicVideos(done);
                });
                it('should find public videos with where parameter', function(done) {
                    Video.findPublicVideos({foo: /bar/})
                    .then(function(){done()})
                    .catch(done)
                });
            });

        });
        describe('Playlist', function() {
            beforeEach(function() {
                this.data = {
                    title: "playlisttitle",
                    description: 'foo',
                    video_urls: "http://www.youtube.com/watch?v=5iZ1-csQFUA \n http://www.youtube.com/watch?v=MRLnOpTe2DY  \n http://www.youtube.com/watch?v=gZ-kgn9xXpg \n http://www.youtube.com/watch?v=1rLjFKdnCGg"
                };
                this.playlist = new Playlist(this.data);
            });
            describe("a playlist is saved", function() {
                it('it should have 4 video refs in video fields', function(done) {
                    this.playlist.save(function(err, playlist) {
                        assert.equal(playlist.videos.length, 4);
                        done();
                    });
                });
            });

        });
    });
});
