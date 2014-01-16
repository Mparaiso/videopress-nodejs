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
		_data;
		toJSON():any;
		toHTML();
		getAttributes();
		setData(_data);
		getData();
	}
	export class Base implements IBase{
		options:any;
		name;
		_data;
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
			attrs.value = utils.returnDefined(this._data,attrs.value,"");
			attrs.type=utils.returnDefined(this.type,attrs.type);
			return attrs;
		}
		setData(data){
			this._data=data;
		}
		getData(){
			return this._data;
		}
		/**
		 * @return {Object}
		 */
		toJSON():any{
			return {
				options:this.options,
				name:this.name,
				type:this.type,
				data:this.getData()
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
		static fromData(data){
			var check = new Check(data.key,{attributes:data.attributes});
			check.options.attributes.value = data.value;
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
		static fromData(data):Radio{
			var radio;
			radio=new Radio(data.key,{attributes:data.attributes});
			radio.attributes.value = data.value;
			radio.options.label = data.key;
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
		template=_.template("<option <%=attributes%> ><%-label%></option>\n");
		/**
		 * @return {String}
		 */
		toHTML(){
			return this.template({attributes:this.renderAttributes(this.getAttributes()),label:this.name})
		}
		static fromData(data):Option{
			var option:Option;
			var attr = utils.returnDefined(data.attributes,{});
			option = new Option(data.key,{attributes:attr});
			option.options.attributes.value=data.value;
			return option;
		}
	}
	export interface Choice{
		key:string;
		value;
		attributes;
	}

	export class Choices extends Base{
		type="choices";
		_choices:Array<Choice>;
		constructor(name,options){
			super(name,options);
			this.choices = this.options.choices||[];
		}
		get choices(){return this._choices;}
		set choices(value){ this._choices=this.normaLizeChoices(value);}
		normaLizeChoices(choices:Array){
			return choices.map((choice,i)=>{
				var o;
				if(_.isString(choice)){
					o={};
					o.key=choice,o.value=i;
					o.attributes={};
				}else{
					o=choice;
					o.attributes=o.attributes || {};
				}
				return o;
			});
		}
		toJSON(){
			var json:any = super.toJSON();
			json.choices=this.choices;
			json.data=this.getData();
			return json;
		}
	}
	export class Select extends Choices{
		type="select";
		template=_.template("<select <%=attributes%> >\n<% _.each(options,function(o){print(o.toHTML());}) %></select>")
		getAttributes(){
			var attrs=super.getAttributes();
			delete attrs.type;
			delete attrs.value;
			return attrs;
		}
		toHTML(){
			return this.template({
				attributes:this.renderAttributes(this.getAttributes())
				,options:this.choices.map(Option.fromData)
			});
		}
		setData(data:Array){
			this._data=_.isArray(data)?data:[data];
			this._choices.forEach(c=>{
				if(c.value in this._data){
					c.attributes.selected="selected";
				}else{
					delete c.attributes.selected;
				}
			});
		}
		getData(){
			return this.choices
				.filter(c=>c.attributes.selected).map(c=>c.value);
		}
	}
	export class CheckboxGroup extends Choices{
		type="checkboxgroup";
		toHTML(){
			return this.choices.map((o)=>{
				var check,label;
				check = Check.fromData(o);
				check.options.label=o.key;
				return check.toHTML();
			}).join('\n');
		}
		setData(data){
			this._data=_.isArray(data)?data:[data];
			this.choices.forEach(c=>{
				if(_.contains(this._data,c.value)){
					c.attributes.checked="checked";
				}else{
					delete c.attributes.checked;
				}
			});
		}
		getData(){
			return this.choices.filter(c=>c.attributes.checked).map(c=>c.value);
		}
	}
	export class RadioGroup extends Choices{
		type="radio-group";
		toHTML(){
			return this.choices.map((choice)=>{
				var radio = Radio.fromData(choice);
				radio.options.attributes.name = this.name;
				radio.options.label= choice.key;
				return radio.toHTML();
			}).join('\n');
		}
		setData(data){
			this._data=data;
			this.choices.forEach(c=>{
				if(c.value in this._data){
					c.attributes.checked="checked";
				}else{
					delete c.attributes.checked;
				}
			});
		}
		getData(){
			return this.choices.filter(c=>c.attributes.checked)
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
				case "checkboxgroup":
					return new widget.CheckboxGroup(name,options);
				case "radiogroup":
					return new widget.RadioGroup(name,options);
				case "select":
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
		_model:any;
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
		toHTML(iterator){
			if(_.isUndefined(iterator)){
				iterator=(w)=>w.toHTML()
			}
			return this.widgets.map(iterator).join("\n");
		}
		toJSON(){
			return this.widgets.map((w)=>w.toJSON());
		}	
		setModel(value){this._model=value;}
		getModel(){return this._model;}
		/**
		 * @chainable
		 * @param {Object} data
		 */
		setData(data){
			var widget,key;
			for(key in data){
				widget = this.getByName(key);
				if(widget) widget.setData(data[key]);
				if(this._model) this._model[key] = data[key];
			}
		}
		getData(){
			var datas={};
			this.widgets.forEach((w)=>datas[w.name]=w.getData(),{})
			return datas;
		}
		getByName(name):widget.Base{
			return _.find(this.widgets,(widget)=>widget.name===name);
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