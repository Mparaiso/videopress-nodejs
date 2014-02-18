/*global describe,it,before,after,beforeEach,afterEach*/
"use strict";
var assert, expect, express, container, request;
expect = require('chai').expect;
assert = require('assert');
express = require('express');
request = require('supertest');
container = require('../js/container');
/**
 * container.middlewares
 */
describe('container.middlewares', function() {
	beforeEach(function() {
		this.app = express();
		this.app.disable('verbose errors');
	});
	// @TODO rewrite the test according to new API
	describe.skip("#belongsToUser", function() {
		var param = "video";
		var user = {
			id: "foo",
			username: "baz",
			toString: function() {
				return this.username;
			}
		};
		var datas = [{
				stub: function(req, res, next) {
					req.isAuthenticated = function() {
						return true;
					};
					req.user = user;
					res.locals[param] = {
						owner: "foo"
					};
					next();
				},
				status: 200,
				scenario: "user is authenticated and own the resource"
			}
 		, {
				stub: function(req, res, next) {
					req.isAuthenticated = function() {
						return true;
					};
					req.user = user;
					res.locals[param] = {
						owner: {
							id: "foo"
						}
					};
					next();
				},
				status: 200,
				scenario: 'user is authenticated ,own the resource and resource.owner is populated'
			}, {
				stub: function(req, res, next) {
					req.isAuthenticated = function() {
						return true;
					};
					req.user = user;
					res.locals[param] = {
						owner: "bar"
					};
					next();
				},
				status: 403,
				scenario: 'user doesnt own the resource'
			}, {
				stub: function(req, res, next) {
					req.isAuthenticated = function() {
						return true;
					};
					req.user = user;
					next();
				},
				status: 403,
				scenario: 'the resource doesnt exist'
			}];
		datas.forEach(function(data) {
			describe(data.scenario, function() {
				it('should be ' + data.status, function(done) {
					this.app.use(data.stub);
					this.app.use(container.middlewares.belongsToUser('video'));
					this.app.get('/', function(req, res) {
						res.send(200);
					});
					request(this.app)
						.get('/')
						.expect(data.status, done);
				});
			});
		});

	});
});