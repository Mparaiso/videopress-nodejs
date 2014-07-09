/*global describe,it,beforeEach,before,after*/
/*
"use strict";
var container = require('../app'),
    async = require('async'),
    assert = require('assert'),
    request = require('supertest').agent,
    expect = require('chai').expect;
var helpers = {};
helpers.resetDB = function(done) {
    async.series([
                container.Video.remove.bind(container.Video),
                container.Playlist.remove.bind(container.Playlist),
                container.User.remove.bind(container.User),
                container.Session.remove.bind(container.Session)
            ], done);
};

before(helpers.resetDB);

var user = {
    signup: function(done) {
        var self = this;
        this.request.get('/signup')
            .expect(200)
            .end(function(err, result) {
                self.body._csrf = result.res.headers._csrf;
                console.log(self.body);
                self.request.post('/signup')
                    .send(self.body)
                    .type('form')
                    //.expect(302)
                    .end(function(err,res){
                        console.log(res.res.text);
                        done();
                    });
            });
    },
    getProfile: function(done) {
        this.request.get('/profile')
            .expect(200)
            .redirects(10)
            .end(done);
    },
    getProfile302: function(done) {
        this.request.get('/profile')
            .expect(302)
            .end(done);
    },
    getLogout: function(done) {
        this.request.get('/logout')
            .expect(200)
            .redirects(10)
            .end(done);
    },
    createVideo: function(done) {
        var self = this;
        this.request
            .get('/profile/video/new')
            .expect(200)
            .end(function(err, res) {
                self.request
                    .post('/profile/video/new')
                    .type('form')
                    .send({
                        url: self.videoUrl,
                        _csrf: res.res.headers._csrf
                    })
                    .expect(302)
                    .end(done);
            });
    }
};
describe('container.app', function() {


    beforeEach(function() {
        this.app = container.app;
        this.request = request(this.app);
    });

    describe("NODE_ENV", function() {
        it('should be set to testing', function() {
            assert(process.env.NODE_ENV === 'testing');
        });
    });
    describe("/search?q=some%20thing", function() {
        it('should be 200', function(done) {
            request(this.app)
                .get('/search?q=universe')
                .expect(200, done);
        });
    });
    describe("/profile", function() {
        beforeEach(helpers.resetDB);
        beforeEach(function() {
            this.body = {
                username: 'foobar',
                password: ['bar', 'bar'],
                email: 'foobar@bar.baz'
            };
        });
        describe("A user registers the website", function() {
            it('should be 200', user.signup);
            describe("/playlist", function() {
                it('should be 200', function(done) {
                    this.request
                        .get('/profile/playlist')
                        .expect('200', done);
                });
            });
        });
    });
    describe("/signup", function() {
        var r = request(container.app);
        beforeEach(function() {
            this.request = r;
            this.body = {
                username: 'foo',
                password: ['bar', 'bar'],
                email: 'foo@bar.baz'
            };
            this.videoUrl = 'http://www.youtube.com/watch?v=QgkwiUMJ41c';
        });

        after(function(done) {
            container.User.remove(done);
        });
        after(function(done) {
            container.Session.remove(done);
        });
        describe("A user tries to go to profile without being logged in", function() {
            it('should be 403', user.getProfile302);
        });
        describe("A user goes to the signup page", function() {
            describe("the user fills the signup form and send it", function() {
                it('should register the user and send him to his profile page', user.signup);
                it('should have created a user in the database', function(done) {
                    var self = this;
                    container.User.findOne({
                        username: self.body.username
                    }, function(err, user) {
                        assert(user && !err);
                        done();
                    });
                });
                describe("the user goes to his profile page", function() {
                    it('should be 200', user.getProfile);
                    describe("the user creates a video", function() {
                        it('should be 302', user.createVideo);
                        it('should create a new video in the database', function(done) {
                            container.Video.findOne({
                                url: this.videoUrl
                            }, function(err, res) {
                                assert(res);
                                done(err);
                            });
                        });
                    });
                    describe("the user delete the previously created video", function() {

                    });
                    describe("the user then logs out", function() {
                        it('should be 302', user.getLogout);
                        it('should be redirected to login', user.getProfile302);
                    });
                });
            });
        });
    });
    it('/ should return the title', function(done) {
        var self = this;
        request(this.app)
            .get('/')
            .expect(200)
            .end(function(err, res) {
                expect(res.text).to.contain(self.app.locals.title);
                done();
            });
    });

    it('/api/video.fromUrl should be ok', function(done) {
        var url = "http://www.youtube.com/watch?v=fwyZqyGEPNk";
        request(this.app)
            .post('/api/video.fromUrl?&url=' + url)
            .expect(200)
            .end(done);
    });
    it('/api/video.fromUrl should be 500', function(done) {
        request(this.app)
            .post('/api/video.fromUrl?&url=foo')
            .expect(500)
            .end(done);
    });
    describe('app.locals', function() {
        describe('#paginate', function() {
            [
                {
                    array: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                    length: 3,
                    expected: [
                        [1, 2, 3],
                        [4, 5, 6],
                        [7, 8, 9],
                        [10]
                    ]
                },
                {
                    array: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                    length: 6,
                    expected: [
                        [1, 2, 3, 4, 5, 6],
                        [7, 8, 9, 10]
                    ]
                }
            ].forEach(function(data) {
                it('should return ' + JSON.stringify(data.expected), function() {
                    assert.deepEqual(this.app.locals.paginate(data.array, data.length), data.expected);
                });
            });
        });
    });
});
*/
