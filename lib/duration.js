/**
 * @author mparaiso <mparaiso@online.fr>
 * @copyright 2013 mparaiso
 * @license http://opensource.org/licenses/MIT MIT
 * 
 * TODO
 * 	- [ ] support negative durations
 * 	- [ ] support adding durations
 * 	- [ ] support subtracting durations
 * 	- [ ] support casting duration to number
 */
"use strict";
var util=require('util')
, _=require('underscore');

var pattern = /^P((\d+)(Y))?((\d+)(M))?((\d+)(D))?((T)((\d+)(H))?((\d+)(M))?(([0-9]+(\.[0-9]+)?)(S))?)?$/
, index={
	years:2
	, months:5
	, days:8
	, hours:12
	, minutes: 15
	, seconds:18
};

/**
 * Deals with ISO durations.
 * <h3>Usage</h3>
 * <p>Parse a String , get duration object
 * <code>
 * var d1 = duration.parse("P1Y3M10D");
 * assert(d.years==1);
 * assert(d.months==3);
 * assert(d.days==10);
 * </code>
 * <p>Create a duration object in an object oriented way
 * <code>
 * var d2 = new duration.Duration("PT3H10M4.05S");
 * assert(d.hours==3);
 * assert(d.minutes==10);
 * assert(d.seconds==4.05);
 * </code>
 * <p>Get a ISO duration string from a Duration object
 * <code>
 * var d = new duration.Duration();
 * d.years=5,d.months=4,d.hours=10;
 * assert(d.toString()=="P5Y4MT10H");
 * </code>
 * @namespace duration namespace
 * @type {Object}
 */
var duration = exports || {};

/**
 * @constructor
 * @param {String} [duration] ISO duration
 */
duration.Duration=function(duration){
	if(duration){
		return this.parse(duration);
	}
	this.years=0;
	this.months=0;
	this.days=0;
	this.hours=0;
	this.minutes=0;
	this.seconds=0;
};

/**
 * Duration prototype
 * @type {Object}
 */
duration.Duration.prototype = {
	 /**
	  * @type {Number}
	  */
	 year:0
	 /**
	  * @type {Number}
	  */
	,months:0
	/**
	 * @type {Number}
	 */
	,days:0
	/**
	 * @type {Number}
	 */
	,hours:0
	/**
	 * @type {Number}
	 */
	,minutes:0
	/**
	 * @type {Number}
	 */
	,seconds:0
	/**
	 * returns a ISO duration
	 * @return {String} 
	 */
	,toString :function(){
		var result = "P";
		if(this.years){
			result+=this.years+"Y";
		}
		if(this.months){
			result+=this.months+"M";
		}
		if(this.days){
			result+=this.days+"D";
		}
		if(this.hours || this.minutes || this.seconds){
			result+="T";
		}
		if(this.hours){
			result+=this.hours+"H";
		}
		if(this.minutes){
			result+=this.minutes+"M";
		}
		if(this.seconds){
			result+=this.seconds+"S";
		}
		return result;
	}
};


/**
 * parse a duration string
 * @param  {String} duration 
 * @return {Duration}         
 */
duration.parse=function(duration){
	var _match = pattern.exec(duration);
	if(_match === null){
	 	throw util.format("%s is not a valid ISO 8601 duration",duration);
	}
	duration = new this.Duration();
	duration.years = parseFloat(_match[index.years])||0;
	duration.months = parseFloat(_match[index.months])||0;
	duration.days = parseFloat(_match[index.days])||0;
	duration.hours = parseFloat(_match[index.hours])||0;
	duration.minutes = parseFloat(_match[index.minutes])||0;
	duration.seconds = parseFloat(_match[index.seconds])||0;
	return duration;
};


