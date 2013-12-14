declare var util;
declare var _;
declare module utils {
    var isDefined: (value: any) => boolean;
    var returnDefined: (...values: any[]) => any;
}
/**
* @namespace
*/
declare module widget {
    interface IBase {
        name;
        options;
        type;
        data;
        toJSON(): any;
        toHTML();
        getAttributes();
    }
    class Base implements IBase {
        public options: any;
        public name;
        public data;
        public type: string;
        public template;
        /**
        * @constructor
        * @param {String} name
        * @param {Object} options
        */
        constructor(name, options?: any);
        public renderAttributes(attrs: Object);
        public getAttributes();
        /**
        * @return {Object}
        */
        public toJSON(): any;
        /**
        * @return {String}
        */
        public toHTML();
        public toString();
    }
    class Text extends Base {
        public type: string;
    }
    class Check extends Text {
        public type: string;
        public template;
        static fromData(data, value): Check;
    }
    class Label extends Base {
        public type: string;
        public template;
        public defaults: {};
        public getAttributes();
        public toHTML();
    }
    class Radio extends Text {
        public type: string;
        static fromData(data, value): Radio;
    }
    class Button extends Text {
        public type: string;
    }
    class Submit extends Button {
        public type: string;
    }
    class Option extends Base {
        public type: string;
        public template;
        /**
        * @return {String}
        */
        public toHTML();
        static fromData(data, index): Option;
    }
    class Select extends Base {
        public type: string;
        public template;
        public toHTML();
    }
    class CheckboxGroup extends Base {
        public type: string;
        public toHTML();
    }
    class RadioGroup extends Base {
        public type: string;
        public toHTML();
    }
    class Choices extends Base {
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
