var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var util = require('util');
var _ = require('underscore');

var utils;
(function (utils) {
    utils.isDefined = function (value) {
        return !_.isUndefined(value);
    };
    utils.returnDefined = function () {
        var values = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            values[_i] = arguments[_i + 0];
        }
        return _.find(values, function (value) {
            return utils.isDefined(value);
        });
    };
})(utils || (utils = {}));

/**
* @namespace
*/
var widget;
(function (widget) {
    var Base = (function () {
        /**
        * @constructor
        * @param {String} name
        * @param {Object} options
        */
        function Base(name, options) {
            if (typeof options === "undefined") { options = {}; }
            this.type = "base";
            this.template = _.template('<%=label%> <input <%=attributes%> />');
            this.name = name;
            this.options = _.extend({}, options);
            if (_.isUndefined(this.options['attributes'])) {
                this.options.attributes = {};
            }
            if (_.isUndefined(this.options['label'])) {
                this.options.label = this.name;
            }
        }
        Base.prototype.renderAttributes = function (attrs) {
            var template = _.template("<% for(attr in attributes){%> <%-attr%>='<%-attributes[attr]%>' <%}%>");
            return template({ attributes: attrs });
        };
        Base.prototype.getAttributes = function () {
            var attrs = _.extend({}, this.options.attributes);
            attrs.name = this.name;
            attrs.value = utils.returnDefined(this.data, attrs.value, "");
            attrs.type = utils.returnDefined(this.type, attrs.type);
            return attrs;
        };

        /**
        * @return {Object}
        */
        Base.prototype.toJSON = function () {
            return {
                options: this.options,
                name: this.name,
                type: this.type,
                data: this.data
            };
        };

        /**
        * @return {String}
        */
        Base.prototype.toHTML = function () {
            return this.template({
                label: new Label(this.options.label, this.options.labelAttributes).toHTML(),
                attributes: this.renderAttributes(this.getAttributes())
            });
        };
        Base.prototype.toString = function () {
            return util.format("[object form.widget.%s]", this.type);
        };
        return Base;
    })();
    widget.Base = Base;

    var Text = (function (_super) {
        __extends(Text, _super);
        function Text() {
            _super.apply(this, arguments);
            this.type = "text";
        }
        return Text;
    })(Base);
    widget.Text = Text;
    var Check = (function (_super) {
        __extends(Check, _super);
        function Check() {
            _super.apply(this, arguments);
            this.type = "check";
            this.template = _.template("<input <%=attributes%> /> <%=label %>");
        }
        Check.fromData = function (data, value) {
            var check = new Check(utils.returnDefined(data.key, data), { attributes: data.attributes });
            check.options.attributes.value = utils.returnDefined(data.value, value);
            check.options.label = utils.returnDefined(data.key, data);
            return check;
        };
        return Check;
    })(Text);
    widget.Check = Check;
    var Label = (function (_super) {
        __extends(Label, _super);
        function Label() {
            _super.apply(this, arguments);
            this.type = "label";
            this.template = _.template("<label <%=attributes%> ><%-name%></label>");
            this.defaults = {};
        }
        Label.prototype.getAttributes = function () {
            return _.extend({}, this.options.attributes, this.defaults);
        };
        Label.prototype.toHTML = function () {
            return this.template({
                attributes: this.renderAttributes(this.getAttributes()),
                name: utils.returnDefined(this.options.value, this.name)
            });
        };
        return Label;
    })(Base);
    widget.Label = Label;
    var Radio = (function (_super) {
        __extends(Radio, _super);
        function Radio() {
            _super.apply(this, arguments);
            this.type = "radio";
        }
        Radio.fromData = function (data, value) {
            var radio;
            if (_.isObject(data)) {
                radio = new Radio(data.key, { attributes: data.attributes });
                radio.attributes.value = data.value;
            } else {
                radio = new Radio(data, { attributes: { value: value } });
            }
            radio.options.label = utils.returnDefined(data.key, data);
            return radio;
        };
        return Radio;
    })(Text);
    widget.Radio = Radio;
    var Button = (function (_super) {
        __extends(Button, _super);
        function Button() {
            _super.apply(this, arguments);
            this.type = "button";
        }
        return Button;
    })(Text);
    widget.Button = Button;
    var Submit = (function (_super) {
        __extends(Submit, _super);
        function Submit() {
            _super.apply(this, arguments);
            this.type = "submit";
        }
        return Submit;
    })(Button);
    widget.Submit = Submit;
    var Option = (function (_super) {
        __extends(Option, _super);
        function Option() {
            _super.apply(this, arguments);
            this.type = "option";
            this.template = _.template("<option <%=attributes%> ><%-label%></option>\n");
        }
        /**
        * @return {String}
        */
        Option.prototype.toHTML = function () {
            return this.template({ attributes: this.renderAttributes(this.getAttributes()), label: this.name });
        };
        Option.fromData = function (data, index) {
            var option;
            if (_.isObject(data)) {
                var attr = utils.returnDefined(data.attributes, {});
                option = new Option(data.key, { attributes: attr });
                if (_.has(data, 'value')) {
                    option.data = data.value;
                }
            } else {
                option = new Option(data);
                option.data = index;
            }
            return option;
        };
        return Option;
    })(Base);
    widget.Option = Option;
    var Select = (function (_super) {
        __extends(Select, _super);
        function Select() {
            _super.apply(this, arguments);
            this.type = "select";
            this.template = _.template("<select <%=attributes%> >\n<% _.each(options,function(o){print(o.toHTML());}) %></select>");
        }
        Select.prototype.toHTML = function () {
            return this.template({
                attributes: this.renderAttributes(this.getAttributes()),
                options: this.options.choices.map(Option.fromData)
            });
        };
        return Select;
    })(Base);
    widget.Select = Select;
    var CheckboxGroup = (function (_super) {
        __extends(CheckboxGroup, _super);
        function CheckboxGroup() {
            _super.apply(this, arguments);
            this.type = "checkbox-group";
        }
        CheckboxGroup.prototype.toHTML = function () {
            var _this = this;
            return this.options.choices.map(function (o, i) {
                var check, label;
                if (typeof o === 'string') {
                    check = Check.fromData(o, i);
                    check.options.label = o;
                } else {
                    check = Check.fromData(_.extend({}, o, { key: _this.name }), i);
                    check.options.label = o.key;
                }
                return check.toHTML();
            }).join('\n');
        };
        return CheckboxGroup;
    })(Base);
    widget.CheckboxGroup = CheckboxGroup;
    var RadioGroup = (function (_super) {
        __extends(RadioGroup, _super);
        function RadioGroup() {
            _super.apply(this, arguments);
            this.type = "radio-group";
        }
        RadioGroup.prototype.toHTML = function () {
            var _this = this;
            return this.options.choices.map(function (choice, index) {
                var radio = Radio.fromData(choice, index);
                radio.options.attributes.name = _this.name;
                radio.options.label = choice.key;
                return radio.toHTML();
            }).join('\n');
        };
        return RadioGroup;
    })(Base);
    widget.RadioGroup = RadioGroup;
    var Choices = (function (_super) {
        __extends(Choices, _super);
        function Choices() {
            _super.apply(this, arguments);
            this.type = "choice";
        }
        /**
        * a HTML representation
        * @return {String}
        */
        Choices.prototype.toHTML = function () {
            var html = "", self = this, _widget;
            if (this.options.multiple == true) {
                if (_.isUndefined(this.options.extended) || this.options.extended === true) {
                    _widget = new CheckboxGroup(this.name, this.options);
                } else {
                    _widget = new Select(this.name, this.options);
                    _widget.options.attributes.multiple = true;
                }
            } else {
                if (this.options.extended === true) {
                    _widget = new RadioGroup(this.name, this.options);
                } else {
                    _widget = new Select(this.name, this.options);
                }
            }
            html += _widget.toHTML();
            return html;
        };

        /**
        * an JSON representation of the widget
        * @return {Object}
        */
        Choices.prototype.toJSON = function () {
            var json = _super.prototype.toJSON.call(this);
            json.choices = this.options.choices.map(function (choice) {
                return choice.toJSON();
            });
            return json;
        };
        return Choices;
    })(Base);
    widget.Choices = Choices;
})(widget || (widget = {}));

var form;
(function (form) {
    var WidgetLoader = (function () {
        function WidgetLoader() {
        }
        WidgetLoader.prototype.getWidget = function (type, name, options) {
            switch (type) {
                case "choices":
                    return new widget.Choices(name, options);
                case "select":
                    return new widget.Select(name, options);
                case "button":
                    return new widget.Button(name, options);
                case "submit":
                    return new widget.Submit(name, options);
                default:
                    return new widget.Text(name, options);
            }
        };
        return WidgetLoader;
    })();
    form.WidgetLoader = WidgetLoader;
    var FormBuilder = (function () {
        function FormBuilder() {
            this.widgets = [];
            this.widgetLoaders = [];
            this.bound = false;
        }
        FormBuilder.prototype.addWidgetLoader = function (widgetLoader) {
            this.widgetLoaders.push(widgetLoader);
        };
        FormBuilder.prototype.resolveWidget = function (type, name, options) {
            var i = 0, widget;
            while (!widget || i < this.widgetLoaders.length) {
                widget = this.widgetLoaders[i].getWidget(type, name, options);
                i += 1;
            }
            return widget;
        };

        FormBuilder.prototype.add = function (type, name, options) {
            if (type instanceof widget.Base) {
                this.widgets.push(type);
            } else {
                var _widget = this.resolveWidget(type, name, options);
                this.widgets.push(_widget);
            }
            return this;
        };
        FormBuilder.prototype.toHTML = function () {
            return this.widgets.map(function (w) {
                return w.toHTML();
            }).join("\n");
        };
        FormBuilder.prototype.toJSON = function () {
            return this.widgets.map(function (w) {
                return w.toJSON();
            });
        };
        FormBuilder.prototype.bindRequest = function () {
        };
        FormBuilder.prototype.setData = function () {
        };
        FormBuilder.prototype.getData = function () {
        };
        return FormBuilder;
    })();
    form.FormBuilder = FormBuilder;
    form.createFormBuilder = function () {
        var form = new FormBuilder();
        form.addWidgetLoader(new WidgetLoader());
        return form;
    };
})(form || (form = {}));

module.exports = {
    widget: widget,
    form: form,
    utils: utils
};
//# sourceMappingURL=forms.js.map
