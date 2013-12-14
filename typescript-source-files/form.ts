declare var require,module;

var util = require('util');
var _ = require('underscore');
/**
 * @namespace
 */
module widget{
	export interface IBase{
		name;
		options;
		type;
		data;
		toJSON();
		toHTML();
	}
	export class Base implements IBase{
		options:any;
		name;
		data;
		type="base";
		/**
		 * @constructor
		 * @param {String} name
		 * @param {Object} options
		 */
		constructor(name,options:any={}){
			this.name=name;
			if(!('attributes' in options)){
				options.attributes = {};
			}
			this.options= options;
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
		 * @return {Object}
		 */
		getDefaults():any{
			return {
				value:this.data||this.options.attributes.value,
				name:this.name
			};
		}
		/**
		 * @return {Object}
		 */
		toJSON(){
			return _.extend({},this.options.attributes,this.getDefaults());
		}
		/**
		 * @return {String}
		 */
		toHTML(){
			return util.format("<input name='%s' %s />",this.name,
				this.renderAttributes(this.toJSON()));
		}
		toString(){
			return util.format("[object form.widget.%s]",this.type);
		}
	}

	export class Text extends Base{
		type="text";
		getDefaults():any{
			return _.extend({},super.getDefaults(),{type:this.type});
		}
	}
	export class Check extends Text{
		type="check";
		static fromData(data,value){
			var check = new Check(_.isUndefined(data.key)?data:data.key,{attributes:data.attributes});
			check.options.attributes.value = _.isUndefined(data.value)?value:data.value;
			return check;
		}
	}
	export class Label extends Base{
		type="label";
		defaults = {};
		getAttributes(){
			return _.extend({},this.options.attributes,this.defaults);
		}
		toHTML(){
			return util.format("<label %s >%s</label>"
				,this.options.value||this.name
				,this.renderAttributes(
					this.getAttributes()));
		}
	}
	export class Radio extends Text{
		type="radio";
		static fromData(option,value):Radio{
			var _option;
			if(_.isObject(option)){
				_option=new Radio(option.key,{attributes:option.attributes});
				_option.attributes.value = option.value;
			}else{
				_option=new Radio(option,{attributes:{value:value}});
			}
			return _option
		}
	}
	export class Button extends Text{
		type="button";
	}
	export class Submit extends Button{
		type="submit";
	}
	export class Option extends Base{
		type="option";
		/**
		 * @return {String}
		 */
		toHTML(){
			var data = this.toJSON();
			delete data.name;
			return util.format("<option %s >%s</option>",
				this.renderAttributes(this.toJSON()),_.escape(this.name));
		}
		static fromData(data,index):Option{
			var option:Option;
			if(_.isObject(data)){
				var attr = data.attributes || {}
				option = new Option(data.key,{attributes:attr});
				if(_.has(data,'value')){
					option.data = data.value;
				}
			}else{
				option = new Option(data);
				if(index)option.data=index;
			}
			return option;
		}
	}
	export class Select extends Base{
		type="select";
		/**
		 * a HTML representation
		 * @return {String}
		 */
		toHTML(){

			var html = "";
			if(this.options.multiple==true){ // checkbox group
				if(this.options.extended===true){
					html+=this.options.options.map((o,i)=>{
						var check = Check.fromData(o,i);
						var label = new Label(o.key||o);
						return check.toHTML()+label.toHTML();
					}).join('\n');
				}else{ //multi select
					html+=util.format("<select %s >\n",this.renderAttributes(_.extend({multiple:true},this.options.attributes)));
					html+=this.options.options.map(Option.fromData).map((option)=>{return option.toHTML()}).join("\n");
					html+=util.format("</select>\n")
				}
			}else{ // radio group
				if(this.options.extended===true){
					html+=this.options.options.map((option,index)=>{
						var radio = Radio.fromData(option,index);
						radio.options.attributes.name = this.name;
						var label = new widget.Label(option.key||option);
						return radio.toHTML()+label.toHTML();
					}).join('\n');
				}else{ // select
					html+=util.format("<select %s >\n",this.renderAttributes(this.options.attributes));
					html+=this.options.options.map(Option.fromData).map((option)=>{return option.toHTML()}).join("\n");
					html+=util.format("</select>\n")
				}
			}

			return html;
		}
		/**
		 * an JSON representation of the widget
		 * @return {Object}
		 */
		toJSON(){
			var json = super.toJSON();
			json.name = this.name;
			delete json.value;
			json.options = this.options.options.map(Option.fromData).map((option)=>{return option.toJSON()});
			return json;
		}
	}
}

module form{
	export interface IWidgetLoader{
		getWidget(type,name,options):widget.Base;
	}
	export class WidgetLoader implements IWidgetLoader{
		getWidget(type:string,name:string,options):widget.Base{
			switch(type){
				case "choice":
					return new widget.Select(name,options);
				case "button":
					return new widget.Button(name,options);
				case "submit":
					return new widget.Submit(name,options);
				default:
					return new widget.Text(name,options);
			}
		}
	}
	export class FormBuilder{
		widgets:Array<widget.Base>=[];
		widgetLoaders:Array<IWidgetLoader>=[];
		name:string;
		constructor(){
			this.addWidgetLoader(new WidgetLoader);
		}
		addWidgetLoader(widgetLoader){
			this.widgetLoaders.push(widgetLoader);
		}
		resolveWidget(type,name,options){
			var i=0,widget;
			while(!widget || i<this.widgetLoaders.length){
				widget = this.widgetLoaders[i].getWidget(type,name,options);
				i+=1;
			}
			return widget;
		}
		bound=false;
		add(widget,name,options){
			if(widget instanceof widget.Base){
				this.widgets.push(widget);
			}else{
				this.resolveWidget(widget,name,options);
			}
			return this;
		}
		toHTML(){
			return this.widgets.map((w)=>w.toHTML()).join("\n");
		}
		toJSON(){
			return this.widgets.map((w)=>w.toJSON());
		}	
		bindRequest(){

		}
		setData(){

		}
		getData(){

		}
	}
}

module.exports = {
	widget:widget,
	form:form
};