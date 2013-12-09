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

//@note @node @express : tester une app avec supertest , https://github.com/visionmedia/supertest
describe("App",function(){
	describe('GET /',function(){
		it("responds with code 200",function(done){
			request(app).get('/').expect(200,done);
		});
	});
});