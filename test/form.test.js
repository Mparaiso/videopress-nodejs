/*global describe,it */
"use strict";

var expect = require('chai').expect;

describe('FORM',function(){
	var form = require('../js/form');
	var attributes = {
		value:"a value",
		required:"true",
		class:"input-small"
	};
	describe("form.widget.Base",function(){
		var base = new form.widget.Base("base",{'attributes':attributes});
		var html = base.toHTML();
		it('should render properly',function(){
			expect(html).to.contain("value");
		});
	});
	describe("form.widget.Text",function(){
		var text= new form.widget.Text("address",{'attributes':attributes});
		text.data = "London";
		it('should render properly',function(){
			expect(text.toHTML()).to.contain(text.data);
		});
	});
	describe("form.widget.Select",function(){
		describe('A select widget with a simple data list',function(){
			var attrs = {
				required:true
			};
			var options = ['London','Paris','Moscow','Zurich'];
			var select = new form.widget.Select("towns",{attributes:attrs});
			select.options.options = options;
			var html = select.toHTML();
			it('should contain a select tag',function(){
				expect(html).to.contain("select");
			});
			it('should be required',function(){
				expect(html).to.contain("required");
			});
			options.forEach(function(option,i){
				it('should contain the right key : '+option,function(){
					expect(html).to.contain(option);
				});
				it('should contain the right value : '+i,function(){
					expect(html).to.contain(option);
				});
			});
		});
		describe('A select widget with a complex data list',function(){
			var select = new form.widget.Select('sex',{attributes:{required:'true'}});
			var options=[
				{key:"male",value:"m"},
				{key:'female',value:'f'},
				{key:'other',value:'o'}
			];
			select.options.options=options;
			var html = select.toHTML();
			var json = select.toJSON();
			it('should render properly',function(){
				expect(html).to.contain('male');
				expect(html).to.contain('m');
				expect(html).to.contain('female');
				expect(html).to.contain('f');
				expect(html).to.contain('other');
				expect(html).to.contain('o');
			});
			it('should return a proper json',function(){
				expect(json).to.have.property('options');
				expect(json.options).to.have.length(3);
			});
		});
	});
});