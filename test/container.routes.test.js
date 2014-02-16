/*global before,it,describe,beforeEach,afterEach */
"use strict";
require('source-map-support').install();
var assert = require('assert');

describe('container.routes', function () {
    /**
     * Route tests
     * @author mparaiso <mparaiso@online.fr>
     */
    var app = require('../app'),
        request = require('supertest'),
        container = app.get('container'),
        db = container.db,
        Video = container.Video;

    describe('container.routes', function () {

        describe('/api/video', function () {
            before(function (done) {
                this._id = db.Types.ObjectId();
                this.video = {
                    url: "fakeurl",
                    _id: this._id,
                    title: "faketitle",
                    description: "fakedescription"
                };
                db.models.Video.remove(done);
            });
            it('POST should return 200', function (done) {
                request(app).post('/api/video').send(this.video).end(done);
            });
            it('GET should return 200', function (done) {
                request(app).get('/api/video/' + this._id).expect(200).end(done);
            });
            it('LIST should return 200', function (done) {
                request(app).get('/api/video').expect(200).end(done);
            });
            it('PUT should return 200', function (done) {
                this.video.title = "new title";
                request(app).put('/api/video/' + this._id).send(this.video).expect(200).end(done);
            });
            it('DELETE should return 200', function (done) {
                request(app).del('/api/video/' + this._id).expect(200).end(done);
            });
        });

        describe('/api/playlist', function () {
            before(function (done) {
                this._id = new db.Types.ObjectId();
                this.playlist = {
                    _id: this._id,
                    title: "Playlist Title",
                    description: "Playlist Description"
                };
                db.models.Playlist.remove(done);
            });

            it('POST should be ok ', function (done) {
                request(app).post('/api/playlist').send(this.playlist).expect(200).end(done);
            });
            it('LIST should be ok ', function (done) {
                request(app).get('/api/playlist').expect(200).end(done);
            });
            it('GET should be ok ', function (done) {
                request(app).get('/api/playlist/' + this._id).expect(200).end(done);
            });
            it('GET should return an error 404', function (done) {
                request(app).get('/api/playlist/52d3fe91d4ffdbe41e000003').expect(404).end(done);
            });
            it('PUT should be ok ', function (done) {
                var data = this.playlist;
                data.title = "New Playlist Title";
                request(app).put('/api/playlist/' + this._id).send(data).expect(200).end(done);
            });
            it('DELETE should be ok ', function (done) {
                request(app).del('/api/playlist/' + this._id).expect(200).end(done);
            });
        });

        describe('/video', function () {
            describe('/:id', function () {
                beforeEach(function (done) {
                    var self = this;
                    Video.fromUrl('http://www.youtube.com/watch?v=QipcqRO7Ehg', function (err, video) {
                        self.id = video.id;
                        done();
                    });
                });
                afterEach(function (done) {
                    Video.remove(done);
                });
                it('should be ok', function (done) {
                    request(app)
                        .get('/video/'.concat(this.id))
                        .expect(200)
                        .end(done);
                });
                it('should be 404', function (done) {
                    request(app)
                        .get('/video/'.concat(db.Types.ObjectId()))
                        .expect(404)
                        .end(done);
                });
                it('should be 500', function (done) {
                    request(app)
                        .get('/video/'.concat("foo"))
                        .expect(500)
                        .end(done);
                });
            });
        });
    });
});