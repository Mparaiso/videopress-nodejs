/*global describe,it */
"use strict";

var expect = require('chai').expect;
var assert = require('assert');
var forms = require('../js/forms');

describe('FORM',function(){
	var attributes = {
		value:"a value",
		required:"true",
		class:"input-small"
	};
	describe("form.widget.Base",function(){
		var base = new forms.widget.Base("base",{'attributes':attributes});
		var html = base.toHTML();
		it('should render properly',function(){
			expect(html).to.contain("value");
		});
	});
	describe("form.widget.Text",function(){
		var text= new forms.widget.Text("address",{'attributes':attributes});
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
			var select = new forms.widget.Select("towns",{attributes:attrs});
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
			var select = new forms.widget.Select('sex',{attributes:{required:'true'}});
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

describe("forms.createFormBuilder",function  () {
	describe("A form",function(){
		var form = forms.form.createFormBuilder();
		var gender_options = ['male','female','other'];
		describe("has fields",function  () {
			form.add('text','firstname')
				.add('text','lastname')
				.add('choice','gender',{options:gender_options,attributes:{required:true}})
				.add('submit','submit',{attributes:{value:'submit'}});
			it('renders properly',function(){
				var html = form.toHTML();
				assert.equal(typeof html,'string');
				console.log(html);
			});
		});
	});
});
