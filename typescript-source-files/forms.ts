//@ sourceMappingURL=forms.js.map
declare var require,module;

var util = require('util');
var _ = require('underscore');

module utils{
	export var isDefined = (value)=>!_.isUndefined(value);
	export var returnDefined =(...values)=>_.find(values,(value)=>isDefined(value));
}

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
		getAttributes();
	}
	export class Base implements IBase{
		options:any;
		name;
		data;
		type="base";
		template=_.template('<%=label%> <input <%=attributes%> />');
		/**
		 * @constructor
		 * @param {String} name
		 * @param {Object} options
		 */
		constructor(name,options:any={}){
			this.name=name;
			this.options= _.extend({},options);
			if(_.isUndefined(this.options['attributes'])){
				this.options.attributes = {};
			}
			if(_.isUndefined(this.options['label'])){
				this.options.label = this.name;
			}			
		}
		renderAttributes(attrs:Object){
			var template = _.template("<% for(attr in attributes){%> <%-attr%>='<%-attributes[attr]%>' <%}%>");
			return template({attributes:attrs});
		}
		getAttributes(){
			var attrs = _.extend({},this.options.attributes);
			attrs.name=this.name;
			attrs.value = utils.returnDefined(this.data,attrs.value,"");
			attrs.type=utils.returnDefined(this.type,attrs.type);
			return attrs;
		}
		/**
		 * @return {Object}
		 */
		toJSON(){
			return {
				options:this.options,
				name:this.name,
				type:this.type,
				data:this.data
			};
		}
		/**
		 * @return {String}
		 */
		toHTML(){
			return this.template({
				label:new Label(this.options.label,this.options.labelAttributes).toHTML()
				,attributes:this.renderAttributes(this.getAttributes())
			});
		}
		toString(){
			return util.format("[object form.widget.%s]",this.type);
		}
	}

	export class Text extends Base{
		type="text";
	}
	export class Check extends Text{
		type="check";
		template=_.template("<input <%=attributes%> /> <%=label %>");
		static fromData(data,value){
			var check = new Check(utils.returnDefined(data.key,data),{attributes:data.attributes});
			check.options.attributes.value = utils.returnDefined(data.value,value);
			check.options.label = utils.returnDefined(data.key,data);
			return check;
		}
	}
	export class Label extends Base{
		type="label";
		template=_.template("<label <%=attributes%> ><%-name%></label>")
		defaults = {};
		getAttributes(){
			return _.extend({},this.options.attributes,this.defaults);
		}
		toHTML(){
			return this.template({
				attributes:this.renderAttributes(this.getAttributes())
				,name:utils.returnDefined(this.options.value,this.name)
			});
		}
	}
	export class Radio extends Text{
		type="radio";
		static fromData(data,value):Radio{
			var radio;
			if(_.isObject(data)){
				radio=new Radio(data.key,{attributes:data.attributes});
				radio.attributes.value = data.value;
			}else{
				radio=new Radio(data,{attributes:{value:value}});
			}
			radio.options.label = utils.returnDefined(data.key,data);
			return radio
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
				var attr = utils.returnDefined(data.attributes,{});
				option = new Option(data.key,{attributes:attr});
				if(_.has(data,'value')){
					option.data = data.value;
				}
			}else{
				option = new Option(data);
				option.data=index;
			}
			return option;
		}
	}
	export class Select extends Base{
		type="select";
		toHTML(){
			var html = "",self=this;
			html+=util.format("<select %s >\n",this.renderAttributes(this.getAttributes()));
			html+=this.options.choices.map(Option.fromData).map((option)=>{return option.toHTML()}).join("\n");
			html+=util.format("\r\n</select>\n")
			return html;
		}
	}
	export class CheckboxGroup extends Base{
		type="checkbox-group";
		toHTML(){
			return this.options.choices.map((o,i)=>{
				var check,label;
				if(typeof o === 'string'){
					check = Check.fromData(o,i);
					check.options.label=o;
				}else{
					check = Check.fromData(_.extend({},o,{key:this.name}),i);
					check.options.label=o.key;
				}
						return check.toHTML();
			}).join('\n');
		}
	}
	export class RadioGroup extends Base{
		type="radio-group";
		toHTML(){
			return this.options.choices.map((choice,index)=>{
						var radio = Radio.fromData(choice,index);
						radio.options.attributes.name = this.name;
						radio.options.label= choice.key;
						return radio.toHTML();
			}).join('\n');
		}
	}
	export class Choice extends Base{
		type="choice";
		/**
		 * a HTML representation
		 * @return {String}
		 */
		toHTML(){
			var html = "",self=this,_widget:Base;
			if(this.options.multiple==true){ // checkbox group
				if(_.isUndefined(this.options.extended) || this.options.extended===true){
					_widget = new CheckboxGroup(this.name,this.options);
				}else{ //multi select
					_widget = new Select(this.name,this.options);
					_widget.options.attributes.multiple=true;
				}
			}else{ // radio group
				if(this.options.extended===true){
					_widget=new RadioGroup(this.name,this.options);
				}else{ // select
					_widget = new Select(this.name,this.options);
				}
			}
			html+=_widget.toHTML();
			return html;
		}
		/**
		 * an JSON representation of the widget
		 * @return {Object}
		 */
		toJSON(){
			var json = super.toJSON();
			json.choices = this.options.choices.map(choice=>choice.toJSON());
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
				case "select":
				case "choice":
					return new widget.Choice(name,options);
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
		add(type,name,options){
			if(type instanceof widget.Base){
				this.widgets.push(type);
			}else{
				var _widget = this.resolveWidget(type,name,options);
				this.widgets.push(_widget);
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
	export var createFormBuilder=function(){
		var form=new FormBuilder();
		form.addWidgetLoader(new WidgetLoader);
		return form;
	}
}

module.exports = {
	widget:widget,
	form:form,
	utils:utils
};