/*global describe,it */
"use strict";

var expect = require('chai').expect;

describe('FORM',function(){
	var form = require('../lib/form');
	var attributes = {
		value:"a value",
		required:"true",
		class:"input-small"
	};
	describe("form.widget.Base",function(){
		var base = new form.widget.Base("base",{'attributes':attributes});
		var html = base.toHTML();
		it('should render properly',function(){
			console.log(html);
			expect(html).to.contain("value");
		});
	});
	describe("form.widget.Text",function(){
		var text= new form.widget.Text("address",{'attributes':attributes});
		text.data = "London";
		it('should render properly',function(){
			console.log(text.toJSON());
			expect(text.toHTML()).to.contain(text.data);
		});
	});
	/*describe("form.widget.Select",function(){
		var attrs = {
			required:true
		};
		var options = ['London','Paris','Moscow','Zurich'];
		var select = new form.widget.Select("towns",{attributes:attrs});
		select.data = options;
		var html = select.toHTML();
		expect(html).to.contain(options);
	});*/
});