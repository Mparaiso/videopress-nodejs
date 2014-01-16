"use strict";

var Rest = require('../rest')
, db = require('../db')
, Playlist = db.models.Playlist;

module.exports =  Rest.create('mongoose',Playlist,{name: 'playlist'});