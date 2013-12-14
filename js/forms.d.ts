declare var util;
declare var _;
/**
* @namespace
*/
declare module widget {
    interface IBase {
        name;
        options;
        type;
        data;
        toJSON();
        toHTML();
    }
    class Base implements IBase {
        public options: any;
        public name;
        public data;
        public type: string;
        /**
        * @constructor
        * @param {String} name
        * @param {Object} options
        */
        constructor(name, options?: any);
        public renderAttr(attr, value);
        public renderAttributes(attrs: Object): string;
        /**
        * @return {Object}
        */
        public getDefaults(): any;
        /**
        * @return {Object}
        */
        public toJSON();
        /**
        * @return {String}
        */
        public toHTML();
        public toString();
    }
    class Text extends Base {
        public type: string;
        public getDefaults(): any;
    }
    class Check extends Text {
        public type: string;
        static fromData(data, value): Check;
    }
    class Label extends Base {
        public type: string;
        public defaults: {};
        public getAttributes();
        public toHTML();
    }
    class Radio extends Text {
        public type: string;
        static fromData(option, value): Radio;
    }
    class Button extends Text {
        public type: string;
    }
    class Submit extends Button {
        public type: string;
    }
    class Option extends Base {
        public type: string;
        /**
        * @return {String}
        */
        public toHTML();
        static fromData(data, index): Option;
    }
    class Select extends Base {
        public type: string;
        /**
        * a HTML representation
        * @return {String}
        */
        public toHTML(): string;
        /**
        * an JSON representation of the widget
        * @return {Object}
        */
        public toJSON();
    }
}
declare module form {
    interface IWidgetLoader {
        getWidget(type, name, options): widget.Base;
    }
    class WidgetLoader implements IWidgetLoader {
        public getWidget(type: string, name: string, options): widget.Base;
    }
    class FormBuilder {
        public widgets: widget.Base[];
        public widgetLoaders: IWidgetLoader[];
        public name: string;
        constructor();
        public addWidgetLoader(widgetLoader): void;
        public resolveWidget(type, name, options);
        public bound: boolean;
        public add(type, name, options): FormBuilder;
        public toHTML(): string;
        public toJSON(): any[];
        public bindRequest(): void;
        public setData(): void;
        public getData(): void;
    }
    var createFormBuilder: () => FormBuilder;
}
