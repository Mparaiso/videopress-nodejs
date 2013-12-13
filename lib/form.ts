///<reference path="../ts/node.d.ts"/>
var util = require('util');
s
module widget{
	export interface IAttribute{
		name;value;
	}
	export class Base{
		attributes={};name;
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
		toHTML(){
			return util.format("<input name='%s' %s />",this.name,this.renderAttributes(this.attributes));
		}
	}
}

module.exports = {
	widget:widget
}