// /*global before,it,describe,beforeEach */
// "use strict";
// var assert = require('assert')
//     , app = require('../index')
//     , request = require('supertest')
//     , db = require('../lib/db');

// before(function(done){
//     this._id = db.Types.ObjectId();
//     this.video =  {url: "fakeurl",
//         _id:this._id,
//         title: "faketitle",
//         description: "fakedescription"
//     };
//     db.models.Video.remove(done);
// });

// describe('/api/video', function () {
//         it('POST should return 200', function (done) {
//         request(app)
//             .post('/api/video')
//             .send(this.video)
//             .end(done);
//     });
//     it('GET should return 200', function (done) {
//         var self=this;
//         request(app)
//             .get('/api/video/'+this._id)
//             .expect(200)
//             .end(function (err, res) {
//                 assert.equal(res.body._id, self._id);
//                 done();
//             });
//     });
//     it('LIST should return 200', function (done) {
//         request(app)
//             .get('/api/video')
//             .expect(200)
//             .end(done);
//     });
//     it('PUT should return 200', function (done) {
//         var self=this;
//         this.video.title="new title";
//         request(app)
//             .put('/api/video/'+this._id)
//             .send(this.video)
//             .expect(200)
//             .end(function(err,response){
//                 assert.equal(response.body.title,self.video.title);
//                 done();
//             });
//     });
//     it('DELETE should return 200', function (done) {
//         request(app)
//             .del('/api/video/'+this._id)
//             .expect(200)
//             .end(done);
//     });
   
// });