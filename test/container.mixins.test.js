/*global describe,it,before,after,beforeEach,afterEach*/
"use strict";
var assert, expect, express, mixins, request;
assert = require('assert');
mixins = require('../js/lib/mixins');
express = require('express');
request = require('supertest').agent;
/**
 * ./js/lib/mixins.js
 */
describe('mixins', function() {
	describe("#map", function() {
		beforeEach(function() {
			this.app = express();
			this.app.map = mixins.map;
		});
		var middleware = function(req, res, next) {
			res.set('fake-header', 'foo');
			next();
		};
		var controller = function(req, res) {
			res.send(200);
		};
		[
			{
				name: "map1",
				map: {
					"/route": {
						use: middleware,
						get: controller
					},
					"/": {
						get: controller
					}
				},
				route: "/route"
			},
			{
				name: "map2",
				route: "/foo/bar/baz/biz",
				map: {
					"/foo/bar/baz/biz": {
						use: middleware,
						all: controller
					}
				}
			}].forEach(function(map) {
			it('middleware should set the  header for ' + map.name, function(done) {
				this.app.map(map.map);
				request(this.app)
					.get(map.route)
					.expect(200)
					.end(function(err, result) {
						assert.equal(result.res.headers['fake-header'], 'foo');
						done();
					});
			});
		});
	});
});