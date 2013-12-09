/*global describe,it,beforeEach */
var db=require('../lib').database;

describe("DATABASE",function(){
	describe("Video model",function(){
		beforeEach(function(){
			this.video= new db.model('Video');
		})
	});
});