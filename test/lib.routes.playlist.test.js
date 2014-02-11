// /*global describe,it,beforeEach,before */

// "use strict";

// var app = require('../index')
//     , request = require('supertest')
//     , expect = require('chai').expect
//     , assert = require('assert')
//     , async = require('async')
//     , db = require('../lib/db')
//     , config = require('../lib/config')
//     , Playlist = db.models.Playlist
//     , _=require('underscore');


// describe("playlist route",function(){
//     var playlist = require('../lib/routes/playlist');
//     it('should be an app',function(){
//         assert(_.has(playlist,"get","post","put","delete"));
//     });
// });

// before(function (done) {
//     db.set('debug',false);
//     this._id = new db.Types.ObjectId();
//     Playlist.remove(done);
// });

// describe('/api/playlist', function () {

//     beforeEach(function () {
//         this.data = {
//             _id: this._id,
//             title: "Playlist Title",
//             description: "Playlist Description"
//         };
//     });

//     it('POST should be ok ', function (done) {
//         request(app).post('/api/playlist').send(this.data).expect(200).end(done);
//     });
//     it('LIST should be ok ', function (done) {
//         request(app).get('/api/playlist').expect(200).end(done);
//     });
//     it('GET should be ok ', function (done) {
//         request(app).get('/api/playlist/' + this._id).expect(200).end(done);
//     });
//     it('GET should return an error 404',function(done){
//         request(app).get('/api/playlist/52d3fe91d4ffdbe41e000003').expect(404).end(done);
//     });
//     it('PUT should be ok ', function (done) {
//         this.data.title="New Playlist Title";
//         var self=this;
//         request(app).put('/api/playlist/' + this._id).send(this.data).expect(200).end(function(err,result){
//             expect(result.res.body.title).to.contain(self.data.title);
//             done();
//         });
//     });
//     it('DELETE should be ok ', function (done) {
//         request(app).del('/api/playlist/' + this._id).expect(200).end(done);
//     });
// });
