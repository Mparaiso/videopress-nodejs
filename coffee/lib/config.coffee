util = require('util')
_ = require('lodash')

###
	PRODUCTION
###
config ={
    connection_string: process.env.EXPRESS_VIDEO_MONGODB_CONNECTION_STRING,
    youtube_apikey: process.env.EXPRESS_VIDEO_YOUTUBE_API_KEY,
    port: process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3000 ,
    ip: process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
    mongoose_debug: false,
    swig_cache:"memory",
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
