/*global describe,it*/
"use strict";
var assert = require('assert')
    , app = require('../index')
    , request = require('supertest')
    , expect = require('chai').expect;

describe("NODE_ENV", function () {
    it('should be set to testing', function () {
        assert(process.env.NODE_ENV === 'testing');
    });
});
describe('app', function () {
    it('/ should return ' + app.locals.title, function (done) {
        request(app)
            .get('/')
            .expect(200)
            .end(function (err, res) {
                expect(res.text).to.contain(app.locals.title);
                done();
            });
    });

    it('/api/video.fromVideoUrl should be ok',function(done){
        var url="http://www.youtube.com/watch?v=fwyZqyGEPNk";
        request(app)
            .post('/api/video.fromVideoUrl?&url='+url)
            .expect(200)
            .end(done);
    });
});