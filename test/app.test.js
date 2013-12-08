/*jslint nomen:true,white:true,node:true,es5:true*/
/*global require,it,describe */
/**
 *  MOCHA TEST for express video
 */
"use strict";
require('chai').should();
var assert = require('assert');
var app=require('../app');
var request=require('supertest');

describe("TEST", function () {
    it("should run", function () {
        assert(true);
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