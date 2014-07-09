util = require('util')
_ = require('lodash')

###
	PRODUCTION
###
config ={
    connection_string: process.env.EXPRESS_VIDEO_MONGODB_CONNECTION_STRING,
    youtube_apikey: process.env.EXPRESS_VIDEO_YOUTUBE_API_KEY,
    port: process.env.PORT,
    mongoose_debug: false,
    swig_cache:true,
    session_secret: process.env.SESSION_SECRET
}
###
	STAGING
###
if process.env.NODE_ENV == "staging"
    _.extend(config, {})
###
	DEVELOPMENT
####
if process.env.NODE_ENV == "development"
    _.extend(config, {swig_cache:false})
### 
	TESTING
###
if process.env.NODE_ENV == "testing"
    _.extend(config,{
        connection_string: process.env.EXPRESS_VIDEO_MONGODB_CONNECTION_STRING_TEST,
        mongoose_debug: false
    })

module.exports = config
