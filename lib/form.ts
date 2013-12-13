///<reference path="../ts/node.d.ts"/>
var util = require('util');

module widget{
	
	export class Base{
		attributes={};
		name;
		data;
		/**
		 * @constructor
		 * @param {String} name
		 * @param {Object} options
		 */
		constructor(name,options:any={}){
			this.name=name;
			if('attributes' in options){
				this.attributes=options.attributes;
			}
		}
		renderAttr(attr,value){
			return util.format(" %s='%s' ",attr,value);
		}
		renderAttributes(attrs:Object){
			var attr,result = "";
			for(attr in attrs){
				result+=this.renderAttr(attr,attrs[attr]);
			}
			return result;
		}
		/**
		 * @return {String}
		 */
		toHTML(){
			return util.format("<input name='%s' %s />",this.name,
				this.renderAttributes(
					util._extend({},this.attributes,{value:this.data||this.attributes.value})));
		}
	}
}

module.exports = {
	widget:widget
}