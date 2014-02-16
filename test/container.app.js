/*global describe,it*/
"use strict";
require('source-map-support').install();
describe('container.app', function () {
    var assert = require('assert'),
        container = require('../js/container'),
        request = require('supertest'),
        expect = require('chai').expect;

    beforeEach(function () {
        this.app = container.app;
    });

    describe("NODE_ENV", function () {
        it('should be set to testing', function () {
            assert(process.env.NODE_ENV === 'testing');
        });
    });
    it('/ should return the title', function (done) {
        var self=this;
        request(this.app)
            .get('/')
            .expect(200)
            .end(function (err, res) {
                expect(res.text).to.contain(self.app.locals.title);
                done();
            });
    });

    it('/api/video.fromUrl should be ok', function (done) {
        var url = "http://www.youtube.com/watch?v=fwyZqyGEPNk";
        request(this.app)
            .post('/api/video.fromUrl?&url=' + url)
            .expect(200)
            .end(done);
    });
    it('/api/video.fromUrl should be 500', function (done) {
        request(this.app)
            .post('/api/video.fromUrl?&url=foo')
            .expect(500)
            .end(done);
    });
    describe('app.locals', function () {
        describe('#paginate', function () {
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
            ].forEach(function (data) {
                    it('should return ' + JSON.stringify(data.expected), function () {
                        assert.deepEqual(this.app.locals.paginate(data.array, data.length), data.expected);
                    });
                });
        });
    });
});
