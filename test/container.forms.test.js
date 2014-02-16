"use strict";

var container = require('../js/container'),
    forms = container.forms,
    assert = require('assert'),
    expect = require('chai').expect;

describe('forms',function(){
    describe('#SignUp',function(){
        var form = forms.SignUp();
        it('should render properly',function(){
            var username = form.find('username');
            var html = username.toHTML();
            expect(html).to.contain('form-control');
            expect(html).to.contain('required');
        })
    });
});