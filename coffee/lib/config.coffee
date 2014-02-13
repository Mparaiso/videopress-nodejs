"use strict"

util = require 'util'

###
	PRODUCTION
###
config = 
	connection_string : process.env.EXPRESS_VIDEO_MONGODB_CONNECTION_STRING,
	youtube_apikey: process.env.EXPRESS_VIDEO_YOUTUBE_API_KEY
###
	STAGING
###
if process.env.NODE_ENV=="staging"
	util._extend config,{}
###
	DEVELOPMENT
####
if process.env.NODE_ENV=="development"
	util._extend config,{}
### 
	TESTING
###
if process.env.NODE_ENV=="testing"
	util._extend config,
		connection_string:process.env.EXPRESS_VIDEO_MONGODB_CONNECTION_STRING_TEST

module.exports = config