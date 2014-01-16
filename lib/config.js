var config, _ = require('underscore');

var production = {
    locals: {
        title: "Node Video"
    },
    youtube_api_key: process.env.EXPRESS_VIDEO_YOUTUBE_API_KEY,
    db: {
        connection_string: process.env.EXPRESS_VIDEO_MONGODB_CONNECTION_STRING
    }
};

var development = {
    db: {
        degub: true,
        connection_string: process.env.EXPRESS_VIDEO_MONGODB_CONNECTION_STRING
    }
};

var testing = {
    debug: true,
    db: {
        degub: true,
        connection_string: process.env.EXPRESS_VIDEO_MONGODB_CONNECTION_STRING_TEST
    }
};

config = production;

if (process.env.NODE_ENV === "development") {
    config = _.extend(production, development);
}
if (process.env.NODE_ENV === "testing") {
    config = _.extend(production, development, testing);
}

module.exports = config;