/*global describe,beforeEach,it*/
"use strict";

var container = require('../app'),
    forms = container.forms,
    assert = require('assert'),
    expect = require('chai').expect;


describe('forms', function() {
    beforeEach(function() {
        this._csrf = "foo";
    });
    describe('#SignUp', function() {
        beforeEach(function() {
            this.form = forms.SignUp(this._csrf);
        });
        it('should render properly', function() {
            var username = this.form.find('username');
            var html = username.toHTML();
            expect(html).to.contain('form-control');
            expect(html).to.contain('required');
        });
        it('should validate', function() {
            var body = {
                username: 'foo',
                email: 'foo@bar.baz',
                password: ['bar', 'bar'],
                _csrf: this._csrf
            };
            this.form.bind(body);
            var valid = this.form.validateSync();
            assert(valid);

        });
        it('should not validate if passwords dont match', function() {
            var body = {
                username: 'foo',
                email: 'foo@bar.baz',
                password: ['bar', 'foo'],
                _csrf: this._csrf
            };
            this.form.bind(body);
            var valid = this.form.validateSync();
            assert(!valid);
        });
    });
    describe("Login", function() {
        beforeEach(function() {
            this.form = forms.Login(this._csrf);
        });
        it('should validate', function() {
            var body = {
                email: "bar@foo.com",
                password: 'foo'
            };
            this.form.bind(body);
            assert(this.form.validateSync());
        });
        it('shouldnt validate if email is incorret', function() {
            var body = {
                email: "foo@bar",
                password: "bar"
            };
            this.form.bind(body);
            assert(!this.form.validateSync());
        });
    });
});