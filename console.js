/*jslint es5: true, white: true ,plusplus: true,nomen: true, sloppy: true */
/**
 * command line tool for mpm.video
 *
 * USAGE
 * =====
 * node console
 *
 * HELP
 * ----
 * node console -h
 * @todo create command playlist:create
 * @todo create command user:create
 */
"use strict";
var commander, container, db, connect, fs, async, exit;

commander = require('commander');
container = require('./js/container');
fs = require('fs');
async = require('async');

exit = function(message, code) {
	if (typeof message === 'number') {
		code = message;
	} else {
		console.log(message);
	}
	if (!module.parent) {
		process.exit(code);
	}
};

commander.name = "mpm.video";

commander
	.version('0.0.1')
	.usage('[command] [options]');

commander
	.command('video:create [video]')
	.description('create a video')
	.option('-u, --from-url <url>', 'create a video from a videosite url')
	.option('-f, --from-file <file>', 'create a video from a json file')
	.action(function(video, options) {
		var Video, json;
		Video = container.db.models.Video;
		if (options.fromUrl) {
			Video.fromUrl(options.fromUrl, function(err, result) {
				if (err) {
					exit(err, 1);
				} else {
					exit('video created successfully from url: ' + options.fromUrl, 0);
				}
			});
		} else if (video || options.fromFile) {
			try {
				if (options.fromFile) {
					video = fs.readFileSync(options.fromFile, "utf-8");
				}
				json = JSON.parse(video);
			} catch (error) {
				exit(error, 1);
			}
			if (json instanceof Array) {
				async.map(json, function(video, callback) {
					if (typeof video === 'string') {
						Video.fromUrl(video, callback);
					} else {
						Video.create(video, callback);
					}
				}, function(err, res) {
					err ? exit(err, 1) : exit('Videos created successfully', 0);
				});
			} else {
				Video.create(json, function(err, res) {
					err ? exit(err, 1) : exit('video created successfully', 0);
				});
			}


		} else {
			exit('Video not provided', 1);
		}
	});
commander
	.command('db:query [query]')
	.description('execute a mongoose query on some collection')
	.action(function(query) {
		container.db.set("debug", false);
		if (query && query.match(/^(Video|Playlist)/)) {
			var f, exec;
			f = new Function('Video', 'Playlist', 'exec', 'exec(' + query + ');');
			exec = function(query) {
				if (typeof query !== "object") {
					exit("Error " + query, 1);
				} else {
					query.exec(function(err, res) {
						if (err) {
							return exit(err, 1);
						}
						console.log(res);
						exit(0);
					});
				}
			};
			f(container.Video, container.Playlist, exec);
		} else {
			exit('missing query!', 1);
		}
	});
if (!module.parent) {
	commander.parse(process.argv);
}

module.exports = commander;