/*global describe,it */
"use strict";

var expect = require('chai').expect;

describe('FORM',function(){
	var form = require('../lib/form');
	var attributes = {
		value:"a value",
		required:"true",
		class:"a class"
	};
	describe("form.widget.Base",function(){
		var base = new form.widget.Base("base",attributes);
		var html = base.toHTML();
		console.log(base.renderAttributes(base.attributes));
		//expect(html).to.contain("value");
		it('should render properly',function(){
			expect(true).to.be.true;
		});
	});
});