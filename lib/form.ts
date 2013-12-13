///<reference path="../ts/node.d.ts"/>
var util = require('util');
var _ = require('underscore');
module widget{
	
	export class Base{
		attributes:any={};
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

		getDefaults():any{
			return {
				value:this.data||this.attributes.value,
				name:this.name
			};
		}
		toJSON(){
			return _.extend({},this.attributes,this.getDefaults());
		}
		/**
		 * @return {String}
		 */
		toHTML(){
			return util.format("<input name='%s' %s />",this.name,
				this.renderAttributes(this.toJSON()));
		}
	}

	export class Text extends Base{
		type="text";
		getDefaults():any{
			var defs=super.getDefaults();
			var opts={type:this.type};
			return _.extend({},defs,opts);
		}
	}
}

module.exports = {
	widget:widget
}