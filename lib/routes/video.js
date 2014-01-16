"use strict";
var app = require('../rest').create('mongoose',require('../db').models.Video,{name:'video'});
module.exports = app;