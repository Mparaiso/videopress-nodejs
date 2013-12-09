/*global describe,it,beforeEach */
"use strict";
var lib=require('../lib')
, assert=require('assert');

describe("DATABASE",function(){
	describe("Video model",function(){
		beforeEach(function(){
			this.video=  new lib.database.models.Video();
			this.video.set({
				title:'video',
				description:'description',
				url:'http://something.web.com',
				thumbail:'http://web.com/image.png',
				originalId:'3DFDDFDDFDF',
				provider:'youtube',
				duration:lib.duration.parse('PT15M30S'),
				publishedAt:new Date('2013-12-11')
			});
		});
		it('should be initalized correctly',function(){
			assert.equal(this.video.get('title'),'video');
			assert.equal(this.video.get('duration').minutes,15);
		});
		it('can be created from a url',function(done){
			var url="http://www.youtube.com/watch?v=7lCDEYXw3mM";
			lib.database.models.Video.fromUrl(url,function(err,video){
					assert(!err);
					assert.equal(video.get('title'),"Google I/O 101: Q&A On Using Google APIs");
				done();
			});
		});
	});
});