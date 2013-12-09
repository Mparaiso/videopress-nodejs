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

 describe("TEST", function () {
    it("should run", function () {
        assert(true);
    });
    it("should run",function(){
    	assert(true);
    });
});

 describe('DURATION',function(){
    var valid_durations = ["P1Y","P10Y5M","P5Y105D","P10Y5M3DT6H9M10S","PT10H7M10.9S","P10YT99.99S"]
    , invalid_durations=["5","P10S","P10Y6D5M"];

    
    valid_durations.forEach(function(duration){
        it("parses duration "+duration,function(){
         assert.doesNotThrow(function(){
            lib.duration.parse(duration);
        });
     });
    });
    invalid_durations.forEach(function(duration){
        it("throws an error on invalid duration : "+duration,function(){
          assert.throws(function(){
            lib.duration.parse(duration);
        });
      });
    });
    it('should return the correct duration object',function(){
        var duration1 = lib.duration.parse("P1Y")
        , duration2 = lib.duration.parse('P10Y5M3DT6H9M10S');
        
        assert.equal(duration1.years,1);
        assert.equal(duration1.days,0);

        assert.equal(duration2.years,10);
        assert.equal(duration2.months,5);
        assert.equal(duration2.days,3);
        assert.equal(duration2.hours,6);
        assert.equal(duration2.minutes,9);
        assert.equal(duration2.seconds,10);
    });
});

 describe("PROVIDERS",function(){
    var youtube_url = 'http://www.youtube.com/watch?v=eOG90Q8EfRo'
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
            assert.equal(this.youtube_provider.getIdFromUrl(youtube_url),"eOG90Q8EfRo");
            assert.equal(this.youtube_provider.getIdFromUrl(vimeo_url),null);
        });
        it('should find youtube video datas',function(){
            this.youtube_provider.request = mocks.youtubeRequestMock;
            assert.equal(typeof this.youtube_provider.request,'function');
            this.youtube_provider.getVideoDataFromUrl(youtube_url,function(err,videoDatas){
                done();
            })
        });
    });
});
//@note @node @express : tester une app avec supertest , https://github.com/visionmedia/supertest
describe("App",function(){
	describe('GET /',function(){
		it("responds with code 200",function(done){
			request(app).get('/').expect(200,done);
		});
	});
});