"use strict";
var models = exports
, mongoose = require('mongoose')
, config = require("./config");


var db = mongoose.connect(config.mongodb_connection_string);

module.exports = db;