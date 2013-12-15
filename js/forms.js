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
            attrs.value = utils.returnDefined(this._data, attrs.value, "");
            attrs.type = utils.returnDefined(this.type, attrs.type);
            return attrs;
        };
        Base.prototype.setData = function (data) {
            this._data = data;
        };
        Base.prototype.getData = function () {
            return this._data;
        };

        /**
        * @return {Object}
        */
        Base.prototype.toJSON = function () {
            return {
                options: this.options,
                name: this.name,
                type: this.type,
                data: this.getData()
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
        Check.fromData = function (data) {
            var check = new Check(data.key, { attributes: data.attributes });
            check.options.attributes.value = data.value;
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
        Radio.fromData = function (data) {
            var radio;
            radio = new Radio(data.key, { attributes: data.attributes });
            radio.attributes.value = data.value;
            radio.options.label = data.key;
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
        Option.fromData = function (data) {
            var option;
            var attr = utils.returnDefined(data.attributes, {});
            option = new Option(data.key, { attributes: attr });
            option.options.attributes.value = data.value;
            return option;
        };
        return Option;
    })(Base);
    widget.Option = Option;

    var Choices = (function (_super) {
        __extends(Choices, _super);
        function Choices(name, options) {
            _super.call(this, name, options);
            this.type = "choices";
            this.choices = this.options.choices || [];
        }
        Object.defineProperty(Choices.prototype, "choices", {
            get: function () {
                return this._choices;
            },
            set: function (value) {
                this._choices = this.normaLizeChoices(value);
            },
            enumerable: true,
            configurable: true
        });
        Choices.prototype.normaLizeChoices = function (choices) {
            return choices.map(function (choice, i) {
                var o;
                if (_.isString(choice)) {
                    o = {};
                    o.key = choice, o.value = i;
                    o.attributes = {};
                } else {
                    o = choice;
                    o.attributes = o.attributes || {};
                }
                return o;
            });
        };
        Choices.prototype.toJSON = function () {
            var json = _super.prototype.toJSON.call(this);
            json.choices = this.choices;
            json.data = this.getData();
            return json;
        };
        return Choices;
    })(Base);
    widget.Choices = Choices;
    var Select = (function (_super) {
        __extends(Select, _super);
        function Select() {
            _super.apply(this, arguments);
            this.type = "select";
            this.template = _.template("<select <%=attributes%> >\n<% _.each(options,function(o){print(o.toHTML());}) %></select>");
        }
        Select.prototype.getAttributes = function () {
            var attrs = _super.prototype.getAttributes.call(this);
            delete attrs.type;
            delete attrs.value;
            return attrs;
        };
        Select.prototype.toHTML = function () {
            return this.template({
                attributes: this.renderAttributes(this.getAttributes()),
                options: this.choices.map(Option.fromData)
            });
        };
        Select.prototype.setData = function (data) {
            var _this = this;
            this._data = _.isArray(data) ? data : [data];
            this._choices.forEach(function (c) {
                if (c.value in _this._data) {
                    c.attributes.selected = "selected";
                } else {
                    delete c.attributes.selected;
                }
            });
        };
        Select.prototype.getData = function () {
            return this.choices.filter(function (c) {
                return c.attributes.selected;
            }).map(function (c) {
                return c.value;
            });
        };
        return Select;
    })(Choices);
    widget.Select = Select;
    var CheckboxGroup = (function (_super) {
        __extends(CheckboxGroup, _super);
        function CheckboxGroup() {
            _super.apply(this, arguments);
            this.type = "checkboxgroup";
        }
        CheckboxGroup.prototype.toHTML = function () {
            return this.choices.map(function (o) {
                var check, label;
                check = Check.fromData(o);
                check.options.label = o.key;
                return check.toHTML();
            }).join('\n');
        };
        CheckboxGroup.prototype.setData = function (data) {
            var _this = this;
            this._data = _.isArray(data) ? data : [data];
            this.choices.forEach(function (c) {
                if (_.contains(_this._data, c.value)) {
                    c.attributes.checked = "checked";
                } else {
                    delete c.attributes.checked;
                }
            });
        };
        CheckboxGroup.prototype.getData = function () {
            return this.choices.filter(function (c) {
                return c.attributes.checked;
            }).map(function (c) {
                return c.value;
            });
        };
        return CheckboxGroup;
    })(Choices);
    widget.CheckboxGroup = CheckboxGroup;
    var RadioGroup = (function (_super) {
        __extends(RadioGroup, _super);
        function RadioGroup() {
            _super.apply(this, arguments);
            this.type = "radio-group";
        }
        RadioGroup.prototype.toHTML = function () {
            var _this = this;
            return this.choices.map(function (choice) {
                var radio = Radio.fromData(choice);
                radio.options.attributes.name = _this.name;
                radio.options.label = choice.key;
                return radio.toHTML();
            }).join('\n');
        };
        RadioGroup.prototype.setData = function (data) {
            var _this = this;
            this._data = data;
            this.choices.forEach(function (c) {
                if (c.value in _this._data) {
                    c.attributes.checked = "checked";
                } else {
                    delete c.attributes.checked;
                }
            });
        };
        RadioGroup.prototype.getData = function () {
            return this.choices.filter(function (c) {
                return c.attributes.checked;
            });
        };
        return RadioGroup;
    })(Choices);
    widget.RadioGroup = RadioGroup;
})(widget || (widget = {}));

var form;
(function (form) {
    var WidgetLoader = (function () {
        function WidgetLoader() {
        }
        WidgetLoader.prototype.getWidget = function (type, name, options) {
            switch (type) {
                case "checkboxgroup":
                    return new widget.CheckboxGroup(name, options);
                case "radiogroup":
                    return new widget.RadioGroup(name, options);
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
        FormBuilder.prototype.toHTML = function (iterator) {
            if (_.isUndefined(iterator)) {
                iterator = function (w) {
                    return w.toHTML();
                };
            }
            return this.widgets.map(iterator).join("\n");
        };
        FormBuilder.prototype.toJSON = function () {
            return this.widgets.map(function (w) {
                return w.toJSON();
            });
        };
        FormBuilder.prototype.setModel = function (value) {
            this._model = value;
        };
        FormBuilder.prototype.getModel = function () {
            return this._model;
        };

        /**
        * @chainable
        * @param {Object} data
        */
        FormBuilder.prototype.setData = function (data) {
            var widget, key;
            for (key in data) {
                widget = this.getByName(key);
                if (widget)
                    widget.setData(data[key]);
                if (this._model)
                    this._model[key] = data[key];
            }
        };
        FormBuilder.prototype.getData = function () {
            var datas = {};
            this.widgets.forEach(function (w) {
                return datas[w.name] = w.getData();
            }, {});
            return datas;
        };
        FormBuilder.prototype.getByName = function (name) {
            return _.find(this.widgets, function (widget) {
                return widget.name === name;
            });
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
