var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var util = require('util');
var _ = require('underscore');

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
            this.attributes = {};
            this.name = name;
            if ('attributes' in options) {
                this.attributes = options.attributes;
            }
        }
        Base.prototype.renderAttr = function (attr, value) {
            return util.format(" %s='%s' ", attr, value);
        };
        Base.prototype.renderAttributes = function (attrs) {
            var attr, result = "";
            for (attr in attrs) {
                result += this.renderAttr(attr, attrs[attr]);
            }
            return result;
        };

        /**
        * @return {Object}
        */
        Base.prototype.getDefaults = function () {
            return {
                value: this.data || this.attributes.value,
                name: this.name
            };
        };

        /**
        * @return {Object}
        */
        Base.prototype.toJSON = function () {
            return _.extend({}, this.attributes, this.getDefaults());
        };

        /**
        * @return {String}
        */
        Base.prototype.toHTML = function () {
            return util.format("<input name='%s' %s />", this.name, this.renderAttributes(this.toJSON()));
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
        Text.prototype.getDefaults = function () {
            return _.extend({}, _super.prototype.getDefaults.call(this), { type: this.type });
        };
        return Text;
    })(Base);
    widget.Text = Text;
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
        }
        /**
        * @return {String}
        */
        Option.prototype.toHTML = function () {
            var data = this.toJSON();
            delete data.name;
            return util.format("<option %s >%s</option>", this.renderAttributes(this.toJSON()), _.escape(this.name));
        };
        return Option;
    })(Base);
    widget.Option = Option;
    var Select = (function (_super) {
        __extends(Select, _super);
        function Select() {
            _super.apply(this, arguments);
            this.data = [];
            this.type = "select";
        }
        Select.prototype.toHTML = function () {
            var html = "";
            html += util.format("<select %s >\n", this.renderAttributes(this.attributes));
            html += this.data.map(function (data) {
                var option = new Option(data.key, { attributes: data.attributes });
                option.data = data.value;
                return option.toHTML();
            }).join("\n");
            html += util.format("</select>\n");
            return html;
        };
        return Select;
    })(Base);
    widget.Select = Select;
})(widget || (widget = {}));

module.exports = {
    widget: widget
};
