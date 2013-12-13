var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="../ts/node.d.ts"/>
var util = require('util');
var _ = require('underscore');
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

        Base.prototype.getDefaults = function () {
            return {
                value: this.data || this.attributes.value,
                name: this.name
            };
        };
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
            var defs = _super.prototype.getDefaults.call(this);
            var opts = { type: this.type };
            return _.extend({}, defs, opts);
        };
        return Text;
    })(Base);
    widget.Text = Text;
})(widget || (widget = {}));

module.exports = {
    widget: widget
};
