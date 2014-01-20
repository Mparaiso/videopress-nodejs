"use strict";
/*global describe,it,beforeEach,before*/
var lib = require('../lib')
    , assert = require('assert')
    , expect = require('chai').expect()
    , config = lib.config
    , db = lib.db
    , Video = db.models.Video
    , Playlist = db.models.Playlist;

db.connect(config.db.connection_string);

before(function(done){
    db.set('debug',false);
    Video.remove(done);
});

describe('db',function(){
    describe('Video',function(){
        beforeEach(function(){
            this.url = "http://www.youtube.com/watch?v=fwyZqyGEPNk";
        });
        it('should create a video from a url',function(done){
            Video.fromUrl(this.url,function(err,result){
                assert(!err);
                assert(result.title);
                done();
            });
        });
    });
});
/*
describe("db", function () {
    db.connect(config.db.connection_string);
    beforeEach(function (done) {
        this.data = {
            title: 'Build an API with Node.js, Mongodb and Cloud Foundry',
            url:'http://www.youtube.com/watch?v=3AKaGShTHpo'
        };
        this.video = new Video(this.data);
        //Video.remove(done);
    });
    describe('Video', function () {

        it('should save', function (done) {
            this.video.save(done);
        });
    });
    describe('Playlist', function () {
        beforeEach(function (done) {
            this.data = {
                title: "playlisttitle"
            };
            this.playlist = new Playlist(this.data);
            //Playlist.remove(done);
        });

        it('should save', function (done) {
            this.playlist.save(done);
        });
    });
});
*/