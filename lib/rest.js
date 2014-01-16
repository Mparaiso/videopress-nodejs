"use strict";
var rest = exports;
var express = require('express')
    , async = require('async')
    , _ = require('underscore');

rest.errors = {};
rest.errors.ModelNotFound = function (message) {
    Error.apply(this, [].slice.call(arguments));
    this.message = message;
    this.name="ModelNotFound";
    this.type = "ModelNotFound";
};
rest.errors.ModelNotFound.prototype = new Error();
rest.errors.ModelNotFound.prototype.constructor = Error;

/**
 * Generic RestFull middleware for connect/express
 * @param {{class:Object,name:String,listMethod:String,getMethod:String,postMethods:String,putMethod:String,validateMethod:String,deleteMethod,allows}} options
 */
rest.Rest = function (app, options) {
    this._options = options || {};
    this._options.allows = this._options.allows || ['list','get','post','put','delete'];
    this._app = app;
};
rest.Rest.prototype.setAdapter = function(adapter){this._adapter = adapter;};
rest.Rest.prototype.getAdapter = function(){return this._adapter;};
rest.Rest.prototype.handle=function(){
    if (_.contains(this._options.allows, 'list')) {
        this._app.get('/', this.list.bind(this));
    }
    if (_.contains(this._options.allows, 'get')) {
        this._app.get('/:id' , this.get.bind(this));
    }
    if (_.contains(this._options.allows, 'post')) {
        this._app.post('/', this.post.bind(this));
    }
    if (_.contains(this._options.allows, 'put')) {
        this._app.put('/:id', this.put.bind(this));
    }
    if (_.contains(this._options.allows, 'delete')) {
        this._app.delete('/:id', this.delete.bind(this));
    }
    return this._app;
};
rest.Rest.prototype.resultFunction = function (req, res, next) {
    var self=this;
    return function (err, result) {
        if (err) {
            console.log(arguments);
            return res.send(500, err.message);
        }
        if(!result){
            return res.send(404,new Error(self._adapter.getName()+" Not Found"));
        }
        return res.json(result);
    };
};
rest.Rest.prototype.list = function (req, res) {
    return this._adapter.findAll(req.query,this.resultFunction(req, res));
};
rest.Rest.prototype.get = function (req, res) {
    return this._adapter.find(req.params.id,this.resultFunction(req,res));
};
rest.Rest.prototype.post = function (req, res) {
    return this._adapter.create(req.body,this.resultFunction(req,res));
};
rest.Rest.prototype.put = function (req, res) {
    return this._adapter.update(req.params.id,req.body,this.resultFunction(req,res));
};
rest.Rest.prototype.delete = function (req, res) {
    return this._adapter.delete(req.params.id,this.resultFunction(req,res));
};

/**
 * @namespace
 */
rest.adapter = {};
/**
 * Base class for adapters
 * @param {Object} model service to query the database
 * @param {string} name  name of the model
 */
rest.adapter.Base=function(model,name){
    this._model=model;
    this._name=name||'model';
};
rest.adapter.Base.prototype.getModel = function () {
    return this._model;
};
rest.adapter.Base.prototype.setModel=function(model){
    this._model=model;
};
rest.adapter.Base.prototype.getName = function () {
    return this._name;
};
rest.adapter.Base.prototype.setName=function(name){
    this._name=name;
};

/**
 * MongooseAdapter
 * @param {Object} model
 * @param {string} name
 */
rest.adapter.MongooseAdapter = function (model, name) {
    rest.adapter.Base.apply(this,[].slice.call(arguments));
};
rest.adapter.MongooseAdapter.prototype  = new rest.adapter.Base();
rest.adapter.MongooseAdapter.prototype.constructor  = rest.adapter.Base;

rest.adapter.MongooseAdapter.prototype.findAll = function (params, callback) {
    var json = _.extend({}, params);
    this._model.find(json,callback);
};
rest.adapter.MongooseAdapter.prototype.find = function (id, callback) {
    return this._model.findById(id,callback);
};
rest.adapter.MongooseAdapter.prototype.create = function (raw, callback) {
    var model = new this._model(raw);
    return model.save(callback);
};
rest.adapter.MongooseAdapter.prototype.update = function (id, raw, callback) {
    var data = (function(){
        var json = _.extend({}, raw);
        delete json._id;
        return json;
    }());
    return this.getModel().findByIdAndUpdate(id,data,{},callback);
};
rest.adapter.MongooseAdapter.prototype.delete = function (id, callback) {
    return this.getModel().findByIdAndRemove(id,{},callback);
};
rest.adapterLoaderResolver={};
/**
 * Object that loads an adapter according to a string.
 */
rest.adapterLoaderResolver.NameLoaderResolver=function(){
    this.resolve=function(name){
        if(name instanceof rest.adapter.Base){
            return name;
        }
        switch(name){
            case 'mongoose':
                return new rest.adapter.MongooseAdapter();
        }
    };
};

/**
 * create a Restfull controller for express
 * @param  {string} adapter_name 
 * @param  {Object} model        
 * @param  {Object} options    
 * @return {app}              
 */
rest.create = function (adapter_name,model,options) {
    options =options || {};
    var app = express();
    var adapterResolver = new rest.adapterLoaderResolver.NameLoaderResolver();
    var adapter = adapterResolver.resolve(adapter_name);
    adapter.setModel(model);
    adapter.setName(options.name);
    var r = new rest.Rest(app, options);
    r.setAdapter(adapter);
    return r.handle();
};
