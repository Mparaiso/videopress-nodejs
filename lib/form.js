///<reference path="../ts/node.d.ts"/>
var util = require('util');

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
        * @return {String}
        */
        Base.prototype.toHTML = function () {
            return util.format("<input name='%s' %s />", this.name, this.renderAttributes(util._extend({}, this.attributes, { value: this.data || this.attributes.value })));
        };
        return Base;
    })();
    widget.Base = Base;
})(widget || (widget = {}));

module.exports = {
    widget: widget
};
