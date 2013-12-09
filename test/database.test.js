/*global describe,it,beforeEach */
"use strict";
var db=require('../lib').database;
var duration = require('../lib').duration;
var assert=require('assert');

describe("DATABASE",function(){
	describe("Video model",function(){
		beforeEach(function(){
			this.video= new db.model('Video');
			this.video.set({
				title:'a video',
				description:'description',
				url:'http://something.web.com',
				thumbail:'http://web.com/image.png',
				originalId:'3DFDDFDDFDF',
				provider:'youtube',
				duration:duration.parse('PT15M30S'),
				publishedAt:new Date('2013-12-11')
			});
		});
	});
});