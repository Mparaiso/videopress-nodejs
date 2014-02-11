/*jslint es5: true, white: true ,plusplus: true,nomen: true, sloppy: true */
/**
 * command line tool for mpm.video
 * @todo create command playlist:create
 * @todo create command user:create
 */
"use strict";
var commander,container, db, connect, config, fs, exit;

commander = require('commander');
container = require('./js/container');
db = container.db;
fs = require('fs');

exit = function(code) {
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
	.option('-d, --from-file <file>', 'create a video from a json file')
	.action(function(video, options) {
		var Video, json, _video;
		Video = db.models.Video;
		connect();
		if (options.fromUrl) {
			Video.fromUrl(options.fromUrl, function(err, result) {
				if (err) {
					console.error(err);
					exit(1);
				} else {
					console.log('video created successfully from url: ' + options.fromUrl);
					exit(0);
				}
			});
		} else {
			try {
				if (options.fromFile) {
					try {
						video = fs.readFileSync(options.fromF, "utf-8");
					} catch (ignore) {}
				}
				json = JSON.parse(video);
			} catch (error) {
				console.error(error);
				exit(1);
			}
			_video = new Video(json);
			_video.save(function(err, res) {
				if (err) {
					console.error(err);
					exit(1);
				} else {
					console.log('video created successfully');
					exit(0);
				}
			});
		}
	});

if (!module.parent) {
	commander.parse(process.argv);
}

module.exports = commander;