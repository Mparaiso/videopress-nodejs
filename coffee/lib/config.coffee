"use strict"

util = require 'util'

###
	PRODUCTION
###
config =
    connection_string: process.env.EXPRESS_VIDEO_MONGODB_CONNECTION_STRING,
    youtube_apikey: process.env.EXPRESS_VIDEO_YOUTUBE_API_KEY
    port: process.env.PORT
    mongoose_debug: false
    swig_cache:true
    session_secret: process.env.SESSION_SECRET
###
	STAGING
###
if process.env.NODE_ENV == "staging"
    util._extend config, {}
###
	DEVELOPMENT
####
if process.env.NODE_ENV == "development"
    util._extend config, {
        swig_cache:false
    }
### 
	TESTING
###
if process.env.NODE_ENV == "testing"
    util._extend config,
        connection_string: process.env.EXPRESS_VIDEO_MONGODB_CONNECTION_STRING_TEST,
        mongoose_debug: false

module.exports = config