/*jslint nomen:true,white:true,node:true,es5:true*/
/*global require,it,describe,beforeEach */
/**
 *  MOCHA TEST for express video
 */
 "use strict";
 require('chai').should();
 var assert = require('assert')
 , app=require('../app')
 , request=require('supertest')
 , lib = require('../lib')
 , mocks =require('./mocks');

 describe("PROVIDERS",function(){
 	var youtube_url = 'http://www.youtube.com/watch?v=7lCDEYXw3mM'
 	, youtube_video_id='7lCDEYXw3mM'
 	, vimeo_url="http://vimeo.com/56166857";

 	describe('youtube provider',function(){
 		beforeEach(function(){
 			this.youtube_provider = new lib.providers.YoutubeProvider();
 		});
 		it('should validate url',function(){
 			assert(this.youtube_provider.isValidUrl(youtube_url));
 			assert.equal(this.youtube_provider.isValidUrl(vimeo_url),false);
 		});
 		it('should find youtube video id',function(){
 			assert.equal(this.youtube_provider.getIdFromUrl(youtube_url),youtube_video_id);
 			assert.equal(this.youtube_provider.getIdFromUrl(vimeo_url),null);
 		});
 		it('should find youtube video datas',function(done){
 			this.youtube_provider.request = mocks.youtubeRequestMock;
 			assert.equal(typeof this.youtube_provider.request,'function');
 			this.youtube_provider.getVideoDataFromUrl(youtube_url,function(err,videoDatas){
 				done();
 			})
 		});
 	});
 });