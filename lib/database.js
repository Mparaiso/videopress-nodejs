"use strict";
var models = exports
, mongoose = require('mongoose')
, config = require("./config");

var db = mongoose.connect(config.mongodb_connection_string);
/**
 * CONFIGURATION
 */
db.set("debug",config.db.debug);

module.exports = db;