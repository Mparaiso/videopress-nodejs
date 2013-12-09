/*global describe,it,beforeEach */
var db=require('../lib').database;
var assert=require('assert');

describe("DATABASE",function(){
	describe("Video model",function(){
		beforeEach(function(){
			this.video= new db.model('Video');
		});
	});
});