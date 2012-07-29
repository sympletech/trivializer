/*
* Kendo UI Mobile v2012.2.710 (http://kendoui.com)
* Copyright 2012 Telerik AD. All rights reserved.
*
* Kendo UI Mobile commercial licenses may be obtained at http://kendoui.com/mobile-license
* If you do not own a commercial license, this file shall be governed by the trial license terms.
*/
;(function($, undefined) {
    /**
     * @name kendo
     * @namespace This object contains all code introduced by the Kendo project, plus helper functions that are used across all widgets.
     */
    var kendo = window.kendo = window.kendo || {},
        extend = $.extend,
        each = $.each,
        proxy = $.proxy,
        isArray = $.isArray,
        noop = $.noop,
        isFunction = $.isFunction,
        math = Math,
        Template,
        JSON = window.JSON || {},
        support = {},
        percentRegExp = /%/,
        formatRegExp = /\{(\d+)(:[^\}]+)?\}/g,
        boxShadowRegExp = /(\d+?)px\s*(\d+?)px\s*(\d+?)px\s*(\d+?)?/i,
        FUNCTION = "function",
        STRING = "string",
        NUMBER = "number",
        OBJECT = "object",
        NULL = "null",
        BOOLEAN = "boolean",
        UNDEFINED = "undefined",
        getterCache = {},
        setterCache = {},
        slice = [].slice,
        globalize = window.Globalize;

    function Class() {}

    Class.extend = function(proto) {
        var base = function() {},
            member,
            that = this,
            subclass = proto && proto.init ? proto.init : function () {
                that.apply(this, arguments);
            },
            fn;

        base.prototype = that.prototype;
        fn = subclass.fn = subclass.prototype = new base();

        for (member in proto) {
            if (typeof proto[member] === OBJECT && !(proto[member] instanceof Array) && proto[member] !== null) {
                // Merge object members
                fn[member] = extend(true, {}, base.prototype[member], proto[member]);
            } else {
                fn[member] = proto[member];
            }
        }

        fn.constructor = subclass;
        subclass.extend = that.extend;

        return subclass;
    };

    var Observable = Class.extend(/** @lends kendo.Observable.prototype */{
        /**
         * Creates an observable instance.
         * @constructs
         * @class Represents a class that can trigger events, along with methods that subscribe handlers to these events.
         */
        init: function() {
            this._events = {};
        },

        bind: function(eventName, handlers, one) {
            var that = this,
                idx,
                eventNames = typeof eventName === STRING ? [eventName] : eventName,
                length,
                original,
                handler,
                handlersIsFunction = typeof handlers === FUNCTION,
                events;

            for (idx = 0, length = eventNames.length; idx < length; idx++) {
                eventName = eventNames[idx];

                handler = handlersIsFunction ? handlers : handlers[eventName];

                if (handler) {
                    if (one) {
                        original = handler;
                        handler = function() {
                            that.unbind(eventName, handler);
                            original.apply(that, arguments);
                        };
                    }
                    events = that._events[eventName] = that._events[eventName] || [];
                    events.push(handler);
                }
            }

            return that;
        },

        one: function(eventNames, handlers) {
            return this.bind(eventNames, handlers, true);
        },

        first: function(eventName, handlers) {
            var that = this,
                idx,
                eventNames = typeof eventName === STRING ? [eventName] : eventName,
                length,
                handler,
                handlersIsFunction = typeof handlers === FUNCTION,
                events;

            for (idx = 0, length = eventNames.length; idx < length; idx++) {
                eventName = eventNames[idx];

                handler = handlersIsFunction ? handlers : handlers[eventName];

                if (handler) {
                    events = that._events[eventName] = that._events[eventName] || [];
                    events.unshift(handler);
                }
            }

            return that;
        },

        trigger: function(eventName, e) {
            var that = this,
                events = that._events[eventName],
                idx,
                length,
                isDefaultPrevented = false;

            if (events) {
                e = e || {};

                e.sender = that;

                e.preventDefault = function () {
                    isDefaultPrevented = true;
                };

                e.isDefaultPrevented = function() {
                    return isDefaultPrevented;
                };

                events = events.slice();

                //Do not cache the length of the events array as removing events attached through one will fail
                for (idx = 0, length = events.length; idx < length; idx++) {
                    events[idx].call(that, e);
                }
            }

            return isDefaultPrevented;
        },

        unbind: function(eventName, handler) {
            var that = this,
                events = that._events[eventName],
                idx,
                length;

            if (events) {
                if (handler) {
                    for (idx = 0, length = events.length; idx < length; idx++) {
                        if (events[idx] === handler) {
                            events.splice(idx, 1);
                        }
                    }
                } else {
                    that._events[eventName] = [];
                }
            }

            return that;
        }
    });

    /**
     * @name kendo.Template.Description
     *
     * @section
     * <p>
     *  Templates offer way of creating HTML chunks. Options such as HTML encoding and compilation for optimal
     *  performance are available.
     * </p>
     *
     * @exampleTitle Basic template
     * @example
     * var inlineTemplate = kendo.template("Hello, #= firstName # #= lastName #");
     * var inlineData = { firstName: "John", lastName: "Doe" };
     * $("#inline").html(inlineTemplate(inlineData));
     *
     * @exampleTitle Output:
     * @example
     * Hello, John Doe!
     *
     * @exampleTitle Encode HTML
     * @example
     * var encodingTemplate = kendo.template("HTML tags are encoded as follows: #:html#");
     * var encodingData = { html: "<strong>lorem ipsum</strong>" };
     * $("#encoding").html(encodingTemplate(encodingData));
     *
     * @exampleTitle Output:
     * @example
     * HTML tags are encoded as follows: <strong>lorem ipsum</strong>
     *
     * @exampleTitle Use javascript in templates
     * @example
     * var encodingTemplate = kendo.template("#if (foo) {# bar #}#");
     * var data = { foo: true};
     * $("#encoding").html(encodingTemplate(data)); // outputs bar
     *
     * @exampleTitle Escape sharp symbols in JavaScript strings
     * @example
     * var encodingTemplate = kendo.template("<a href='\\#'>Link</a>");
     *
     * @exampleTitle Escape sharp symbols in script templates
     * @example
     * <script type="text/x-kendo-template" id="template">
     *  <a href="\#">Link</a>
     * </script>
     *
     * <script>
     * var encodingTemplate = kendo.template($("#template").html());
     * </script>
     */

     function compilePart(part, stringPart) {
         if (stringPart) {
             return "'" +
                 part.split("'").join("\\'")
                     .split('\\"').join('\\\\\\"')
                     .replace(/\n/g, "\\n")
                     .replace(/\r/g, "\\r")
                     .replace(/\t/g, "\\t") + "'";
         } else {
             var first = part.charAt(0),
                 rest = part.substring(1);

             if (first === "=") {
                 return "+(" + rest + ")+";
             } else if (first === ":") {
                 return "+e(" + rest + ")+";
             } else {
                 return ";" + part + ";o+=";
             }
         }
     }

    var argumentNameRegExp = /^\w+/,
        encodeRegExp = /\$\{([^}]*)\}/g,
        escapedCurlyRegExp = /\\\}/g,
        curlyRegExp = /__CURLY__/g,
        escapedSharpRegExp = /\\#/g,
        sharpRegExp = /__SHARP__/g;

    /**
     * @name kendo.Template
     * @namespace
     */
    Template = /** @lends kendo.Template */ {
        paramName: "data", // name of the parameter of the generated template
        useWithBlock: true, // whether to wrap the template in a with() block
        /**
         * Renders a template for each item of the data.
         * @ignore
         * @name kendo.Template.render
         * @static
         * @function
         * @param {String} [template] The template that will be rendered
         * @param {Array} [data] Data items
         * @returns {String} The rendered template
         */
        render: function(template, data) {
            var idx,
                length,
                html = "";

            for (idx = 0, length = data.length; idx < length; idx++) {
                html += template(data[idx]);
            }

            return html;
        },
        /**
         * Compiles a template to a function that builds HTML. Useful when a template will be used several times.
         * @ignore
         * @name kendo.Template.compile
         * @static
         * @function
         * @param {String} [template] The template that will be compiled
         * @param {Object} [options] Compilation options
         * @returns {Function} The compiled template
         */
        compile: function(template, options) {
            var settings = extend({}, this, options),
                paramName = settings.paramName,
                argumentName = paramName.match(argumentNameRegExp)[0],
                useWithBlock = settings.useWithBlock,
                functionBody = "var o,e=kendo.htmlEncode;",
                parts,
                idx;

            if (isFunction(template)) {
                if (template.length === 2) {
                    //looks like jQuery.template
                    return function(d) {
                        return template($, { data: d }).join("");
                    };
                }
                return template;
            }

            functionBody += useWithBlock ? "with(" + paramName + "){" : "";

            functionBody += "o=";

            parts = template
                .replace(escapedCurlyRegExp, "__CURLY__")
                .replace(encodeRegExp, "#=e($1)#")
                .replace(curlyRegExp, "}")
                .replace(escapedSharpRegExp, "__SHARP__")
                .split("#");

            for (idx = 0; idx < parts.length; idx ++) {
                functionBody += compilePart(parts[idx], idx % 2 === 0);
            }

            functionBody += useWithBlock ? ";}" : ";";

            functionBody += "return o;";

            functionBody = functionBody.replace(sharpRegExp, "#");

            try {
                return new Function(argumentName, functionBody);
            } catch(e) {
                throw new Error(kendo.format("Invalid template:'{0}' Generated code:'{1}'", template, functionBody));
            }
        }
    };

function pad(number) {
    return number < 10 ? "0" + number : number;
}

    //JSON stringify
(function() {
    var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {
            "\b": "\\b",
            "\t": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            "\"" : '\\"',
            "\\": "\\\\"
        },
        rep,
        toString = {}.toString;

    if (typeof Date.prototype.toJSON !== FUNCTION) {

        /** @ignore */
        Date.prototype.toJSON = function (key) {
            var that = this;

            return isFinite(that.valueOf()) ?
                that.getUTCFullYear()     + "-" +
                pad(that.getUTCMonth() + 1) + "-" +
                pad(that.getUTCDate())      + "T" +
                pad(that.getUTCHours())     + ":" +
                pad(that.getUTCMinutes())   + ":" +
                pad(that.getUTCSeconds())   + "Z" : null;
        };

        String.prototype.toJSON = Number.prototype.toJSON = /** @ignore */ Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    function quote(string) {
        escapable.lastIndex = 0;
        return escapable.test(string) ? "\"" + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === STRING ? c :
                "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
        }) + "\"" : "\"" + string + "\"";
    }

    function str(key, holder) {
        var i,
            k,
            v,
            length,
            mind = gap,
            partial,
            value = holder[key],
            type;

        if (value && typeof value === OBJECT && typeof value.toJSON === FUNCTION) {
            value = value.toJSON(key);
        }

        if (typeof rep === FUNCTION) {
            value = rep.call(holder, key, value);
        }

        type = typeof value;
        if (type === STRING) {
            return quote(value);
        } else if (type === NUMBER) {
            return isFinite(value) ? String(value) : NULL;
        } else if (type === BOOLEAN || type === NULL) {
            return String(value);
        } else if (type === OBJECT) {
            if (!value) {
                return NULL;
            }
            gap += indent;
            partial = [];
            if (toString.apply(value) === "[object Array]") {
                length = value.length;
                for (i = 0; i < length; i++) {
                    partial[i] = str(i, value) || NULL;
                }
                v = partial.length === 0 ? "[]" : gap ?
                    "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]" :
                    "[" + partial.join(",") + "]";
                gap = mind;
                return v;
            }
            if (rep && typeof rep === OBJECT) {
                length = rep.length;
                for (i = 0; i < length; i++) {
                    if (typeof rep[i] === STRING) {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ": " : ":") + v);
                        }
                    }
                }
            } else {
                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ": " : ":") + v);
                        }
                    }
                }
            }

            v = partial.length === 0 ? "{}" : gap ?
                "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}" :
                "{" + partial.join(",") + "}";
            gap = mind;
            return v;
        }
    }

    if (typeof JSON.stringify !== FUNCTION) {
        JSON.stringify = function (value, replacer, space) {
            var i;
            gap = "";
            indent = "";

            if (typeof space === NUMBER) {
                for (i = 0; i < space; i += 1) {
                    indent += " ";
                }

            } else if (typeof space === STRING) {
                indent = space;
            }

            rep = replacer;
            if (replacer && typeof replacer !== FUNCTION && (typeof replacer !== OBJECT || typeof replacer.length !== NUMBER)) {
                throw new Error("JSON.stringify");
            }

            return str("", {"": value});
        };
    }
})();

// Date and Number formatting
(function() {
    var dateFormatRegExp = /dddd|ddd|dd|d|MMMM|MMM|MM|M|yyyy|yy|HH|H|hh|h|mm|m|fff|ff|f|tt|ss|s|"[^"]*"|'[^']*'/g,
        standardFormatRegExp =  /^(n|c|p|e)(\d*)$/i,
        literalRegExp = /["'].*?["']/g,
        commaRegExp = /\,/g,
        EMPTY = "",
        POINT = ".",
        COMMA = ",",
        SHARP = "#",
        ZERO = "0",
        PLACEHOLDER = "??",
        EN = "en-US";

    //cultures
    kendo.cultures = {"en-US" : {
        name: EN,
        numberFormat: {
            pattern: ["-n"],
            decimals: 2,
            ",": ",",
            ".": ".",
            groupSize: [3],
            percent: {
                pattern: ["-n %", "n %"],
                decimals: 2,
                ",": ",",
                ".": ".",
                groupSize: [3],
                symbol: "%"
            },
            currency: {
                pattern: ["($n)", "$n"],
                decimals: 2,
                ",": ",",
                ".": ".",
                groupSize: [3],
                symbol: "$"
            }
        },
        calendars: {
            standard: {
                days: {
                    names: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                    namesAbbr: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                    namesShort: [ "Su", "Mo", "Tu", "We", "Th", "Fr", "Sa" ]
                },
                months: {
                    names: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                    namesAbbr: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                },
                AM: [ "AM", "am", "AM" ],
                PM: [ "PM", "pm", "PM" ],
                patterns: {
                    d: "M/d/yyyy",
                    D: "dddd, MMMM dd, yyyy",
                    F: "dddd, MMMM dd, yyyy h:mm:ss tt",
                    g: "M/d/yyyy h:mm tt",
                    G: "M/d/yyyy h:mm:ss tt",
                    m: "MMMM dd",
                    M: "MMMM dd",
                    s: "yyyy'-'MM'-'ddTHH':'mm':'ss",
                    t: "h:mm tt",
                    T: "h:mm:ss tt",
                    u: "yyyy'-'MM'-'dd HH':'mm':'ss'Z'",
                    y: "MMMM, yyyy",
                    Y: "MMMM, yyyy"
                },
                "/": "/",
                ":": ":",
                firstDay: 0
            }
        }
    }};

    /**
     * @name kendo.Globalization
     * @namespace
     */
     /**
     * @name kendo.Globalization.Description
     *
     * @section Globalization is the process of designing and developing an
     * application that works in multiple cultures. The culture defines specific information
     * for the number formats, week and month names, date and time formats and etc.
     *
     * @section Kendo exposes <strong><em>culture(cultureName)</em></strong> method which allows to select the culture
     * script corresponding to the "culture name". kendo.culture() method uses the passed culture name
     * to select a culture from the culture scripts that you have included and then sets the current culture. If there is no
     * corresponding culture then the method will try to find culture which is equal to the country part of the culture name.
     * If no culture is found the default one is used.
     *
     * <h3>Define current culture settings</h3>
     *
     * @exampleTitle Include culture scripts and select culture
     * @example
     *
     * <script src="jquery.js" ></script>
     * <script src="kendo.all.min.js"></script>
     * <script src="kendo.culture.en-GB.js"></script>
     * <script type="text/javascript">
     *    //set current culture to the "en-GB" culture script.
     *    kendo.culture("en-GB");
     * </script>
     *
     * @exampleTitle Select closest culture
     * @example
     *
     * <script src="jquery.js" ></script>
     * <script src="kendo.all.min.js"></script>
     * <script src="kendo.culture.fr.js"></script>
     * <script type="text/javascript">
     *    //set current culture to the "fr" culture script.
     *    kendo.culture("fr-FR");
     * </script>
     *
     * @exampleTitle Get current culture
     * @example
     * var cultureInfo = kendo.culture();
     *
     * <h3>Find culture object</h3>
     *
     * @section Kendo also exposes <strong><em>findCulture(cultureName)</em></strong> method which returns a culture object which corresponds to
     * the passed culture name. If there is no such culture in the registered culture scripts, the method will try to find a culture object
     * which corresponds to the country part of the culture name. If no culture is found, the result will be <strong>null</strong>.
     *
     * @exampleTitle Find a culture object
     * @example
     *
     * <script src="jquery.js" ></script>
     * <script src="kendo.all.min.js"></script>
     * <script src="kendo.culture.fr.js"></script>
     * <script type="text/javascript">
     *    //finds the "fr-FR" culture object.
     *    var culture = kendo.findCulture("fr-FR");
     * </script>
     *
     * @section
     * <h3>Format number or date object</h3>
     *
     * Kendo exposes methods which can format number or date object using specific format string and the current specified culture:
     * @section
     * <h4><code>kendo.toString(object, format)</code> - returns a string representation of the current object using specific format.</h4>
     * @exampleTitle Formats number and date objects
     * @example
     * //format number using standard number format
     * kendo.toString(10.12, "n"); //10.12
     * kendo.toString(10.12, "n0"); //10
     * kendo.toString(10.12, "n5"); //10.12000
     * kendo.toString(10.12, "c"); //$10.12
     * kendo.toString(0.12, "p"); //12.00 %
     * //format number using custom number format
     * kendo.toString(19.12, "00##"); //0019
     * //format date
     * kendo.toString(new Date(2010, 9, 5), "yyyy/MM/dd" ); // "2010/10/05"
     * kendo.toString(new Date(2010, 9, 5), "dddd MMMM d, yyyy" ); // "Tuesday October 5, 2010"
     * kendo.toString(new Date(2010, 10, 10, 22, 12), "hh:mm tt" ); // "10:12 PM"
     *
     * @section
     * <h4>kendo.format - replaces each format item in a specified string with the text equivalent of a corresponding object's value.</h4>
     *  @exampleTitle String format
     *  @example
     *  kendo.format("{0} - {1}", 12, 24); //12 - 24
     *  kendo.format("{0:c} - {1:c}", 12, 24); //$12.00 - $24.00
     *
     * @section
     * <h3>Parsing a string</h3>
     *
     * Kendo exposes methods which converts the specified string to date or number object:
     * <ol>
     *    <li>
     *       <code>kendo.parseInt(string, [culture])</code> - converts a string to a whole number using the specified culture (current culture by default).
     *        @exampleTitle Parse string to integer
     *        @example
     *
     *        //assumes that current culture defines decimal separator as "."
     *        kendo.parseInt("12.22"); //12
     *
     *        //assumes that current culture defines decimal separator as ",", group separator as "." and currency symbol as "€"
     *        kendo.parseInt("1.212,22 €"); //1212
     *    </li>
     *    <li>
     *       <code>kendo.parseFloat(string, [culture])</code> - converts a string to a number with floating point using the specified culture (current culture by default).
     *        @exampleTitle Parse string to float
     *        @example
     *
     *        //assumes that current culture defines decimal separator as "."
     *        kendo.parseFloat("12.22"); //12.22
     *
     *        //assumes that current culture defines decimal separator as ",", group separator as "." and currency symbol as "€"
     *        kendo.parseFloat("1.212,22 €"); //1212.22
     *    </li>
     *    <li>
     *       <code>kendo.parseDate(string, [formats], [culture])</code> - converts a string to a JavaScript Date object, taking into account the given format/formats (or the given culture's set of default formats).
     *       Current culture is used if one is not specified.
     *        @exampleTitle Parse string to float
     *        @example
     *
     *        //current culture is "en-US"
     *        kendo.parseDate("12/22/2000"); //Fri Dec 22 2000
     *        kendo.parseDate("2000/12/22", "yyyy/MM/dd"); //Fri Dec 22 2000
     *    </li>
     * </ol>
     *
     * @section
     * <h3>Number formatting</h3>
     * The purpose of number formatting is to convert Number object to a human readable string using culture's specific settings. <code>kendo.format</code> and <code>kendo.toString</code>
     * methods support standard and custom numeric formats:
     * <h4>Standard numeric formats</h4>
     *<strong>n</strong> for number
     *       @exampleTitle Formatting using "n" format
     *       @example
     *       kendo.culture("en-US");
     *       kendo.toString(1234.567, "n"); //1,234.57
     *
     *       kendo.culture("de-DE");
     *       kendo.toString(1234.567, "n3"); //1.234,567
     *@section
     *<strong>c</strong> for currency
     *       @exampleTitle Formatting using "c" format
     *       @example
     *       kendo.culture("en-US");
     *       kendo.toString(1234.567, "c"); //$1,234.57
     *
     *       kendo.culture("de-DE");
     *       kendo.toString(1234.567, "c3"); //1.234,567 €
     *@section
     *<strong>p</strong> for percentage (number is multiplied by 100)
     *       @exampleTitle Formatting using "p" format
     *       @example
     *       kendo.culture("en-US");
     *       kendo.toString(0.222, "p"); //22.20 %
     *
     *       kendo.culture("de-DE");
     *       kendo.toString(0.22, "p3"); //22.000 %
     *@section
     *<strong>e</strong> for exponential
     *       @exampleTitle Formatting using "e" format
     *       @example
     *       kendo.toString(0.122, "e"); //1.22e-1
     *       kendo.toString(0.122, "e4"); //1.2200e-1
     *
     * @section
     * <h4>Custom numeric formats</h4>
     * You can create custom numeric format string using one or more custom numeric specifiers. Custom numeric format string is any tha is not a standard numeric format.
     * <div class="details-list">
     *   <h4 class="details-title">Format specifiers</h4>
     *   <dl>
     *     <dt>
     *       "0" - zero placeholder
     *     </dt>
     *     <dd>Replaces the zero with the corresponding digit if one is present; otherwise, zero appears in the result string - <code>kendo.toString(1234.5678, "00000") -> 01235</code></dd>
     *     <dt>
     *       "#" - digit placeholder
     *     </dt>
     *     <dd>Replaces the pound sign with the corresponding digit if one is present; otherwise, no digit appears in the result string - <code>kendo.toString(1234.5678, "#####") -> 1235</code></dd>
     *     <dt>
     *       "." - Decimal placeholder
     *     </dt>
     *     <dd>Determines the location of the decimal separator in the result string - <code>kendo.tostring(0.45678, "0.00") -> 0.46 </code>(en-us)</dd>
     *     <dt>
     *       "," - group separator placeholder
     *     </dt>
     *     <dd>Insert localized group separator between each group - <code>kendo.tostring(12345678, "##,#") -> 12,345,678</code>(en-us)</dd>
     *     <dt>
     *       "%" - percentage placeholder
     *     </dt>
     *     <dd>Multiplies a number by 100 and inserts a localized percentage symbol in the result string</dd>
     *     <dt>
     *       "e" - exponential notation
     *     </dt>
     *     <dd><code>kendo.toString(0.45678, "e0") -> 5e-1</code></dd>
     *     <dt>
     *       ";" - section separator
     *     </dt>
     *     <dd>Defines sections wih separate format strings for positive, negative, and zero numbers</dd>
     *     <dt>
     *       "string"/'string' - Literal string delimiter
     *     </dt>
     *     <dd>Indicates that the enclosed characters should be copied to the result string</dd>
     *   </dl>
     * </div>
     *
     * @section
     * <h3>Date formatting</h3>
     * The purpose of date formatting is to convert Date object to a human readable string using culture's specific settings. <code>kendo.format</code> and <code>kendo.toString</code>
     * methods support standard and custom date formats:
     * <h4>Standard date formats</h4>
     * <div class="details-list">
     *   <h4 class="details-title">Format specifiers</h4>
     *   <dl>
     *     <dt>
     *       "d" - short date pattern
     *     </dt>
     *     <dd><code>kendo.toString(new Date(2000, 10, 6), "d") -> 11/6/2000</code></dd>
     *     <dt>
     *       "D" - long date pattern
     *     </dt>
     *     <dd><code>kendo.toString(new Date(2000, 10, 6), "D") -> Monday, November 06, 2000</code></dd>
     *     <dt>
     *       "F" - Full date/time pattern
     *     </dt>
     *     <dd><code>kendo.toString(new Date(2000, 10, 6), "D") -> Monday, November 06, 2000 12:00:00 AM</code></dd>
     *     <dt>
     *       "g" - General date/time pattern (short time)
     *     </dt>
     *     <dd><code>kendo.toString(new Date(2000, 10, 6), "g") -> 11/6/2000 12:00 AM</code></dd>
     *     <dt>
     *       "G" - General date/time pattern (long time)
     *     </dt>
     *     <dd><code>kendo.toString(new Date(2000, 10, 6), "G") -> 11/6/2000 12:00:00 AM</code></dd>
     *     <dt>
     *       "M/m" - Month/day pattern
     *     </dt>
     *     <dd><code>kendo.toString(new Date(2000, 10, 6), "m") -> November 06</code></dd>
     *     <dt>
     *       "u" - Universal sortable date/time pattern
     *     </dt>
     *     <dd><code>kendo.toString(new Date(2000, 10, 6), "u") -> 2000-11-06 00:00:00Z</code></dd>
     *     <dt>
     *       "Y/y" - Year/month pattern
     *     </dt>
     *     <dd><code>kendo.toString(new Date(2000, 10, 6), "y") -> November, 2000</code></dd>
     *   </dl>
     * </div>
     *
     *@section
     * <h4>Custom date formats</h4>
     * <div class="details-list">
     *   <h4 class="details-title">Format specifiers</h4>
     *   <dl>
     *     <dt>
     *       "d"
     *     </dt>
     *     <dd>The day of the month, from 1 through 31</dd>
     *     <dt>
     *       "dd"
     *     </dt>
     *     <dd>The day of the month, from 01 through 31.</dd>
     *     <dt>
     *       "ddd"
     *     </dt>
     *     <dd>iThe abbreviated name of the day of the week</dd>
     *     <dt>
     *       "dddd"
     *     </dt>
     *     <dd>The full name of the day of the week</dd>
     *     <dt>
     *       "f"
     *     </dt>
     *     <dd>The tenths of a second in a date and time value</dd>
     *     <dt>
     *       "ff"
     *     </dt>
     *     <dd>The hundredths of a second in a date and time value</dd>
     *     <dt>
     *       "fff"
     *     </dt>
     *     <dd>The milliseconds in a date and time value</dd>
     *     <dt>
     *       "M"
     *     </dt>
     *     <dd>The month, from 1 through 12</dd>
     *     <dt>
     *       "MM"
     *     </dt>
     *     <dd>The month, from 01 through 12</dd>
     *     <dt>
     *       "MMM"
     *     </dt>
     *     <dd>The abbreviated name of the month</dd>
     *     <dt>
     *       "MMMM"
     *     </dt>
     *     <dd>The full name of the month</dd>
     *     <dt>
     *       "h"
     *     </dt>
     *     <dd>The hour, using a 12-hour clock from 1 to 12</dd>
     *     <dt>
     *       "hh"
     *     </dt>
     *     <dd>The hour, using a 12-hour clock from 01 to 12</dd>
     *     <dt>
     *       "H"
     *     </dt>
     *     <dd>The hour, using a 24-hour clock from 1 to 23</dd>
     *     <dt>
     *       "HH"
     *     </dt>
     *     <dd>The hour, using a 24-hour clock from 01 to 23</dd>
     *     <dt>
     *       "m"
     *     </dt>
     *     <dd>The minute, from 0 through 59</dd>
     *     <dt>
     *       "mm"
     *     </dt>
     *     <dd>The minute, from 00 through 59</dd>
     *     <dt>
     *       "s"
     *     </dt>
     *     <dd>The second, from 0 through 59</dd>
     *     <dt>
     *       "ss"
     *     </dt>
     *     <dd>The second, from 00 through 59</dd>
     *     <dt>
     *       "tt"
     *     </dt>
     *     <dd>The AM/PM designator</dd>
     *   </dl>
     * </div>
     *
     * @section
     * <p><h3>Widgets that depend on current culture are:</h3>
     *    <ul>
     *        <li> Calendar </li>
     *        <li> DatePicker </li>
     *        <li> TimePicker </li>
     *        <li> NumericTextBox </li>
     *    </ul>
     * </p>
     */

     function findCulture(culture) {
        if (culture) {
            if (culture.numberFormat) {
                return culture;
            }

            if (typeof culture === STRING) {
                var cultures = kendo.cultures;
                return cultures[culture] || cultures[culture.split("-")[0]] || null;
            }

            return null;
        }

        return null;
    }

    function getCulture(culture) {
        if (culture) {
            culture = findCulture(culture);
        }

        return culture || kendo.cultures.current;
    }

    kendo.culture = function(cultureName) {
        var cultures = kendo.cultures, culture;

        if (cultureName !== undefined) {
            culture = findCulture(cultureName) || cultures[EN];
            culture.calendar = culture.calendars.standard;
            cultures.current = culture;
        } else {
            return cultures.current;
        }
    };

    kendo.findCulture = findCulture;
    kendo.getCulture = getCulture;

    //set current culture to en-US.
    kendo.culture(EN);

    function formatDate(date, format, culture) {
        culture = getCulture(culture);

        var calendar = culture.calendars.standard,
            days = calendar.days,
            months = calendar.months;

        format = calendar.patterns[format] || format;

        return format.replace(dateFormatRegExp, function (match) {
            var result;

            if (match === "d") {
                result = date.getDate();
            } else if (match === "dd") {
                result = pad(date.getDate());
            } else if (match === "ddd") {
                result = days.namesAbbr[date.getDay()];
            } else if (match === "dddd") {
                result = days.names[date.getDay()];
            } else if (match === "M") {
                result = date.getMonth() + 1;
            } else if (match === "MM") {
                result = pad(date.getMonth() + 1);
            } else if (match === "MMM") {
                result = months.namesAbbr[date.getMonth()];
            } else if (match === "MMMM") {
                result = months.names[date.getMonth()];
            } else if (match === "yy") {
                result = pad(date.getFullYear() % 100);
            } else if (match === "yyyy") {
                result = date.getFullYear();
            } else if (match === "h" ) {
                result = date.getHours() % 12 || 12;
            } else if (match === "hh") {
                result = pad(date.getHours() % 12 || 12);
            } else if (match === "H") {
                result = date.getHours();
            } else if (match === "HH") {
                result = pad(date.getHours());
            } else if (match === "m") {
                result = date.getMinutes();
            } else if (match === "mm") {
                result = pad(date.getMinutes());
            } else if (match === "s") {
                result = date.getSeconds();
            } else if (match === "ss") {
                result = pad(date.getSeconds());
            } else if (match === "f") {
                result = math.floor(date.getMilliseconds() / 100);
            } else if (match === "ff") {
                result = math.floor(date.getMilliseconds() / 10);
            } else if (match === "fff") {
                result = date.getMilliseconds();
            } else if (match === "tt") {
                result = date.getHours() < 12 ? calendar.AM[0] : calendar.PM[0];
            }

            return result !== undefined ? result : match.slice(1, match.length - 1);
        });
    }

    //number formatting
    function formatNumber(number, format, culture) {
        culture = getCulture(culture);

        var numberFormat = culture.numberFormat,
            groupSize = numberFormat.groupSize[0],
            groupSeparator = numberFormat[COMMA],
            decimal = numberFormat[POINT],
            precision = numberFormat.decimals,
            pattern = numberFormat.pattern[0],
            literals = [],
            symbol,
            isCurrency, isPercent,
            customPrecision,
            formatAndPrecision,
            negative = number < 0,
            integer,
            fraction,
            integerLength,
            fractionLength,
            replacement = EMPTY,
            value = EMPTY,
            idx,
            length,
            ch,
            hasGroup,
            hasNegativeFormat,
            decimalIndex,
            sharpIndex,
            zeroIndex,
            startZeroIndex,
            start = -1,
            end;

        //return empty string if no number
        if (number === undefined) {
            return EMPTY;
        }

        if (!isFinite(number)) {
            return number;
        }

        //if no format then return number.toString() or number.toLocaleString() if culture.name is not defined
        if (!format) {
            return culture.name.length ? number.toLocaleString() : number.toString();
        }

        formatAndPrecision = standardFormatRegExp.exec(format);

        /* standard formatting */
        if (formatAndPrecision) {
            format = formatAndPrecision[1].toLowerCase();

            isCurrency = format === "c";
            isPercent = format === "p";

            if (isCurrency || isPercent) {
                //get specific number format information if format is currency or percent
                numberFormat = isCurrency ? numberFormat.currency : numberFormat.percent;
                groupSize = numberFormat.groupSize[0];
                groupSeparator = numberFormat[COMMA];
                decimal = numberFormat[POINT];
                precision = numberFormat.decimals;
                symbol = numberFormat.symbol;
                pattern = numberFormat.pattern[negative ? 0 : 1];
            }

            customPrecision = formatAndPrecision[2];

            if (customPrecision) {
                precision = +customPrecision;
            }

            //return number in exponential format
            if (format === "e") {
                return customPrecision ? number.toExponential(precision) : number.toExponential(); // toExponential() and toExponential(undefined) differ in FF #653438.
            }

            // multiply if format is percent
            if (isPercent) {
                number *= 100;
            }

            number = number.toFixed(precision);
            number = number.split(POINT);

            integer = number[0];
            fraction = number[1];

            //exclude "-" if number is negative.
            if (negative) {
                integer = integer.substring(1);
            }

            value = integer;
            integerLength = integer.length;

            //add group separator to the number if it is longer enough
            if (integerLength >= groupSize) {
                value = EMPTY;
                for (idx = 0; idx < integerLength; idx++) {
                    if (idx > 0 && (integerLength - idx) % groupSize === 0) {
                        value += groupSeparator;
                    }
                    value += integer.charAt(idx);
                }
            }

            if (fraction) {
                value += decimal + fraction;
            }

            if (format === "n" && !negative) {
                return value;
            }

            number = EMPTY;

            for (idx = 0, length = pattern.length; idx < length; idx++) {
                ch = pattern.charAt(idx);

                if (ch === "n") {
                    number += value;
                } else if (ch === "$" || ch === "%") {
                    number += symbol;
                } else {
                    number += ch;
                }
            }

            return number;
        }

        //custom formatting
        //
        //separate format by sections.

        //make number positive
        if (negative) {
            number = -number;
        }

        format = format.split(";");
        if (negative && format[1]) {
            //get negative format
            format = format[1];
            hasNegativeFormat = true;
        } else if (number === 0) {
            //format for zeros
            format = format[2] || format[0];
            if (format.indexOf(SHARP) == -1 && format.indexOf(ZERO) == -1) {
                //return format if it is string constant.
                return format;
            }
        } else {
            format = format[0];
        }

        if (format.indexOf("'") > -1 || format.indexOf("\"") > -1) {
            format = format.replace(literalRegExp, function(match) {
                literals.push(match);
                return PLACEHOLDER;
            });
        }

        isCurrency = format.indexOf("$") != -1;
        isPercent = format.indexOf("%") != -1;

        //multiply number if the format has percent
        if (isPercent) {
            number *= 100;
        }

        if (isCurrency || isPercent) {
            //get specific number format information if format is currency or percent
            numberFormat = isCurrency ? numberFormat.currency : numberFormat.percent;
            groupSize = numberFormat.groupSize[0];
            groupSeparator = numberFormat[COMMA];
            decimal = numberFormat[POINT];
            precision = numberFormat.decimals;
            symbol = numberFormat.symbol;
        }

        hasGroup = format.indexOf(COMMA) > -1;
        if (hasGroup) {
            format = format.replace(commaRegExp, EMPTY);
        }

        decimalIndex = format.indexOf(POINT);
        length = format.length;

        if (decimalIndex != -1) {
            zeroIndex = format.lastIndexOf(ZERO);
            sharpIndex = format.lastIndexOf(SHARP);
            fraction = number.toString().split(POINT)[1] || EMPTY;

            if (sharpIndex > zeroIndex && fraction.length > (sharpIndex - zeroIndex)) {
                idx = sharpIndex;
            } else if (zeroIndex != -1 && zeroIndex >= decimalIndex) {
                idx = zeroIndex;
            }

            if (idx) {
                number = number.toFixed(idx - decimalIndex);
            }

        } else {
            number = number.toFixed(0);
        }

        sharpIndex = format.indexOf(SHARP);
        startZeroIndex = zeroIndex = format.indexOf(ZERO);

        //define the index of the first digit placeholder
        if (sharpIndex == -1 && zeroIndex != -1) {
            start = zeroIndex;
        } else if (sharpIndex != -1 && zeroIndex == -1) {
            start = sharpIndex;
        } else {
            start = sharpIndex > zeroIndex ? zeroIndex : sharpIndex;
        }

        sharpIndex = format.lastIndexOf(SHARP);
        zeroIndex = format.lastIndexOf(ZERO);

        //define the index of the last digit placeholder
        if (sharpIndex == -1 && zeroIndex != -1) {
            end = zeroIndex;
        } else if (sharpIndex != -1 && zeroIndex == -1) {
            end = sharpIndex;
        } else {
            end = sharpIndex > zeroIndex ? sharpIndex : zeroIndex;
        }

        if (start == length) {
            end = start;
        }

        if (start != -1) {
            value = number.toString().split(POINT);
            integer = value[0];
            fraction = value[1] || EMPTY;

            integerLength = integer.length;
            fractionLength = fraction.length;

            //add group separator to the number if it is longer enough
            if (hasGroup) {
                if (integerLength === groupSize && integerLength < decimalIndex - startZeroIndex) {
                    integer = groupSeparator + integer;
                } else if (integerLength > groupSize) {
                    value = EMPTY;
                    for (idx = 0; idx < integerLength; idx++) {
                        if (idx > 0 && (integerLength - idx) % groupSize === 0) {
                            value += groupSeparator;
                        }
                        value += integer.charAt(idx);
                    }

                    integer = value;
                }
            }

            number = format.substring(0, start);

            if (negative && !hasNegativeFormat) {
                number += "-";
            }

            for (idx = start; idx < length; idx++) {
                ch = format.charAt(idx);

                if (decimalIndex == -1) {
                    if (end - idx < integerLength) {
                        number += integer;
                        break;
                    }
                } else {
                    if (zeroIndex != -1 && zeroIndex < idx) {
                        replacement = EMPTY;
                    }

                    if ((decimalIndex - idx) <= integerLength && decimalIndex - idx > -1) {
                        number += integer;
                        idx = decimalIndex;
                    }

                    if (decimalIndex === idx) {
                        number += (fraction ? decimal : EMPTY) + fraction;
                        idx += end - decimalIndex + 1;
                        continue;
                    }
                }

                if (ch === ZERO) {
                    number += ch;
                    replacement = ch;
                } else if (ch === SHARP) {
                    number += replacement;
                }
            }

            if (end >= start) {
                number += format.substring(end + 1);
            }

            //replace symbol placeholders
            if (isCurrency || isPercent) {
                value = EMPTY;
                for (idx = 0, length = number.length; idx < length; idx++) {
                    ch = number.charAt(idx);
                    value += (ch === "$" || ch === "%") ? symbol : ch;
                }
                number = value;
            }

            if (literals[0]) {
                length = literals.length;
                for (idx = 0; idx < length; idx++) {
                    number = number.replace(PLACEHOLDER, literals[idx]);
                }
            }
        }

        return number;
    }

    var toString = function(value, fmt, culture) {
        if (fmt) {
            if (value instanceof Date) {
                return formatDate(value, fmt, culture);
            } else if (typeof value === NUMBER) {
                return formatNumber(value, fmt, culture);
            }
        }

        return value !== undefined ? value : "";
    };

    if (globalize) {
        toString = proxy(globalize.format, globalize);
    }

    kendo.format = function(fmt) {
        var values = arguments;

        return fmt.replace(formatRegExp, function(match, index, placeholderFormat) {
            var value = values[parseInt(index, 10) + 1];

            return toString(value, placeholderFormat ? placeholderFormat.substring(1) : "");
        });
    };

    kendo._extractFormat = function (format) {
        if (format.slice(0,3) === "{0:") {
            format = format.slice(3, format.length - 1);
        }

        return format;
    };

    kendo.toString = toString;
    })();


(function() {
    var nonBreakingSpaceRegExp = /\u00A0/g,
        exponentRegExp = /[eE][\-+]?[0-9]+/,
        shortTimeZoneRegExp = /[+|\-]\d{1,2}/,
        longTimeZoneRegExp = /[+|\-]\d{1,2}:\d{2}/,
        formatsSequence = ["G", "g", "d", "F", "D", "y", "m", "T", "t"];

    function outOfRange(value, start, end) {
        return !(value >= start && value <= end);
    }

    function designatorPredicate(designator) {
        return designator.charAt(0);
    }

    function mapDesignators(designators) {
        return $.map(designators, designatorPredicate);
    }

    function parseExact(value, format, culture) {
        if (!value) {
            return null;
        }

        var lookAhead = function (match) {
                var i = 0;
                while (format[idx] === match) {
                    i++;
                    idx++;
                }
                if (i > 0) {
                    idx -= 1;
                }
                return i;
            },
            getNumber = function(size) {
                var rg = new RegExp('^\\d{1,' + size + '}'),
                    match = value.substr(valueIdx, size).match(rg);

                if (match) {
                    match = match[0];
                    valueIdx += match.length;
                    return parseInt(match, 10);
                }
                return null;
            },
            getIndexByName = function (names) {
                var i = 0,
                    length = names.length,
                    name, nameLength;

                for (; i < length; i++) {
                    name = names[i];
                    nameLength = name.length;

                    if (value.substr(valueIdx, nameLength) == name) {
                        valueIdx += nameLength;
                        return i + 1;
                    }
                }
                return null;
            },
            checkLiteral = function() {
                var result = false;
                if (value.charAt(valueIdx) === format[idx]) {
                    valueIdx++;
                    result = true;
                }
                return result;
            },
            calendar = culture.calendars.standard,
            year = null,
            month = null,
            day = null,
            hours = null,
            minutes = null,
            seconds = null,
            milliseconds = null,
            idx = 0,
            valueIdx = 0,
            literal = false,
            date = new Date(),
            shortYearCutOff = 30,
            defaultYear = date.getFullYear(),
            ch, count, length, pattern,
            pmHour, UTC, ISO8601, matches,
            amDesignators, pmDesignators,
            hoursOffset, minutesOffset;

        if (!format) {
            format = "d"; //shord date format
        }

        //if format is part of the patterns get real format
        pattern = calendar.patterns[format];
        if (pattern) {
            format = pattern;
        }

        format = format.split("");
        length = format.length;

        for (; idx < length; idx++) {
            ch = format[idx];

            if (literal) {
                if (ch === "'") {
                    literal = false;
                } else {
                    checkLiteral();
                }
            } else {
                if (ch === "d") {
                    count = lookAhead("d");
                    day = count < 3 ? getNumber(2) : getIndexByName(calendar.days[count == 3 ? "namesAbbr" : "names"]);

                    if (day === null || outOfRange(day, 1, 31)) {
                        return null;
                    }
                } else if (ch === "M") {
                    count = lookAhead("M");
                    month = count < 3 ? getNumber(2) : getIndexByName(calendar.months[count == 3 ? 'namesAbbr' : 'names']);

                    if (month === null || outOfRange(month, 1, 12)) {
                        return null;
                    }
                    month -= 1; //because month is zero based
                } else if (ch === "y") {
                    count = lookAhead("y");
                    year = getNumber(count < 3 ? 2 : 4);
                    if (year === null) {
                        year = defaultYear;
                    }
                    if (year < shortYearCutOff) {
                        year = (defaultYear - defaultYear % 100) + year;
                    }
                } else if (ch === "h" ) {
                    lookAhead("h");
                    hours = getNumber(2);
                    if (hours == 12) {
                        hours = 0;
                    }
                    if (hours === null || outOfRange(hours, 0, 11)) {
                        return null;
                    }
                } else if (ch === "H") {
                    lookAhead("H");
                    hours = getNumber(2);
                    if (hours === null || outOfRange(hours, 0, 23)) {
                        return null;
                    }
                } else if (ch === "m") {
                    lookAhead("m");
                    minutes = getNumber(2);
                    if (minutes === null || outOfRange(minutes, 0, 59)) {
                        return null;
                    }
                } else if (ch === "s") {
                    lookAhead("s");
                    seconds = getNumber(2);
                    if (seconds === null || outOfRange(seconds, 0, 59)) {
                        return null;
                    }
                } else if (ch === "f") {
                    count = lookAhead("f");
                    milliseconds = getNumber(count);
                    if (milliseconds === null || outOfRange(milliseconds, 0, 999)) {
                        return null;
                    }
                } else if (ch === "t") {
                    count = lookAhead("t");
                    amDesignators = calendar.AM;
                    pmDesignators = calendar.PM;

                    if (count === 1) {
                        amDesignators = mapDesignators(amDesignators);
                        pmDesignators = mapDesignators(pmDesignators);
                    }

                    pmHour = getIndexByName(pmDesignators);
                    if (!pmHour && !getIndexByName(amDesignators)) {
                        return null;
                    }
                }
                else if (ch === "z") {
                    UTC = true;
                    count = lookAhead("z");

                    if (value.substr(valueIdx, 1) === "Z") {
                        if (!ISO8601) {
                            return null;
                        }

                        checkLiteral();
                        continue;
                    }

                    matches = value.substr(valueIdx, 6)
                                   .match(count > 2 ? longTimeZoneRegExp : shortTimeZoneRegExp);

                    if (!matches) {
                        return null;
                    }

                    matches = matches[0];
                    valueIdx = matches.length;
                    matches = matches.split(":");

                    hoursOffset = parseInt(matches[0], 10);
                    if (outOfRange(hoursOffset, -12, 13)) {
                        return null;
                    }

                    if (count > 2) {
                        minutesOffset = parseInt(matches[1], 10);
                        if (isNaN(minutesOffset) || outOfRange(minutesOffset, 0, 59)) {
                            return null;
                        }
                    }
                } else if (ch === "T") {
                    ISO8601 = checkLiteral();
                } else if (ch === "'") {
                    literal = true;
                    checkLiteral();
                } else {
                    checkLiteral();
                }
            }
        }

        if (pmHour && hours < 12) {
            hours += 12;
        }

        if (day === null) {
            day = 1;
        }

        if (UTC) {
            if (hoursOffset) {
                hours += -hoursOffset;
            }

            if (minutesOffset) {
                minutes += -minutesOffset;
            }

            return new Date(Date.UTC(year, month, day, hours, minutes, seconds, milliseconds));
        }

        return new Date(year, month, day, hours, minutes, seconds, milliseconds);
    }

    kendo.parseDate = function(value, formats, culture) {
        if (value instanceof Date) {
            return value;
        }

        var idx = 0,
            date = null,
            length, patterns;

        culture = kendo.getCulture(culture);

        if (!formats) {
            formats = [];
            patterns = culture.calendar.patterns;
            length = formatsSequence.length;

            for (; idx < length; idx++) {
                formats[idx] = patterns[formatsSequence[idx]];
            }
            formats[idx] = "ddd MMM dd yyyy HH:mm:ss";
            formats[++idx] = "yyyy-MM-ddTHH:mm:ss.fffzzz";
            formats[++idx] = "yyyy-MM-ddTHH:mm:sszzz";
            formats[++idx] = "yyyy-MM-ddTHH:mmzzz";
            formats[++idx] = "yyyy-MM-ddTHH:mmzz";
            formats[++idx] = "yyyy-MM-dd";

            idx = 0;
        }

        formats = isArray(formats) ? formats: [formats];
        length = formats.length;

        for (; idx < length; idx++) {
            date = parseExact(value, formats[idx], culture);
            if (date) {
                return date;
            }
        }

        return date;
    };

    kendo.parseInt = function(value, culture) {
        var result = kendo.parseFloat(value, culture);
        if (result) {
            result = result | 0;
        }
        return result;
    };

    kendo.parseFloat = function(value, culture, format) {
        if (!value && value !== 0) {
           return null;
        }

        if (typeof value === NUMBER) {
           return value;
        }

        value = value.toString();
        culture = kendo.getCulture(culture);

        var number = culture.numberFormat,
            percent = number.percent,
            currency = number.currency,
            symbol = currency.symbol,
            percentSymbol = percent.symbol,
            negative = value.indexOf("-") > -1,
            parts, isPercent;

        //handle exponential number
        if (exponentRegExp.test(value)) {
            value = parseFloat(value);
            if (isNaN(value)) {
                value = null;
            }
            return value;
        }

        if (value.indexOf(symbol) > -1 || (format && format.toLowerCase().indexOf("c") > -1)) {
            number = currency;
            parts = number.pattern[0].replace("$", symbol).split("n");
            if (value.indexOf(parts[0]) > -1 && value.indexOf(parts[1]) > -1) {
                value = value.replace(parts[0], "").replace(parts[1], "");
                negative = true;
            }
        } else if (value.indexOf(percentSymbol) > -1) {
            isPercent = true;
            number = percent;
            symbol = percentSymbol;
        }

        value = value.replace("-", "")
                     .replace(symbol, "")
                     .replace(nonBreakingSpaceRegExp, " ")
                     .split(number[","].replace(nonBreakingSpaceRegExp, " ")).join("")
                     .replace(number["."], ".");

        value = parseFloat(value);

        if (isNaN(value)) {
            value = null;
        } else if (negative) {
            value *= -1;
        }

        if (value && isPercent) {
            value /= 100;
        }

        return value;
    };

    if (globalize) {
        kendo.parseDate = proxy(globalize.parseDate, globalize);
        kendo.parseFloat = proxy(globalize.parseFloat, globalize);
    }
})();

    function wrap(element) {
        var browser = $.browser, percentage;

        if (!element.parent().hasClass("k-animation-container")) {
            var shadow = element.css(kendo.support.transitions.css + "box-shadow") || element.css("box-shadow"),
                radius = shadow ? shadow.match(boxShadowRegExp) || [ 0, 0, 0, 0, 0 ] : [ 0, 0, 0, 0, 0 ],
                blur = math.max((+radius[3]), +(radius[4] || 0)),
                left = (-radius[1]) + blur,
                right = (+radius[1]) + blur,
                bottom = (+radius[2]) + blur,
                width = element[0].style.width,
                height = element[0].style.height,
                percentWidth = percentRegExp.test(width),
                percentHeight = percentRegExp.test(height);

            if (browser.opera) { // Box shadow can't be retrieved in Opera
                left = right = bottom = 5;
            }

            percentage = percentWidth || percentHeight;

            if (!percentWidth) { width = element.outerWidth(); }
            if (!percentHeight) { height = element.outerHeight(); }

            element.wrap(
                         $("<div/>")
                         .addClass("k-animation-container")
                         .css({
                             width: width,
                             height: height,
                             marginLeft: -left,
                             paddingLeft: left,
                             paddingRight: right,
                             paddingBottom: bottom
                         }));

            if (percentage) {
                element.css({
                    width: "100%",
                    height: "100%",
                    boxSizing: "border-box",
                    mozBoxSizing: "border-box",
                    webkitBoxSizing: "border-box"
                });
            }
        } else {
            var wrapper = element.parent(".k-animation-container"),
                wrapperStyle = wrapper[0].style;

            if (wrapper.is(":hidden")) {
                wrapper.show();
            }

            percentage = percentRegExp.test(wrapperStyle.width) || percentRegExp.test(wrapperStyle.height);

            if (!percentage) {
                wrapper.css({
                    width: element.outerWidth(),
                    height: element.outerHeight()
                });
            }
        }

        if (browser.msie && math.floor(browser.version) <= 7) {
            element.css({
                zoom: 1
            });
        }

        return element.parent();
    }

    function deepExtend(destination) {
        var i = 1,
            length = arguments.length;

        for (i = 1; i < length; i++) {
            deepExtendOne(destination, arguments[i]);
        }

        return destination;
    }

    function deepExtendOne(destination, source) {
        var property,
            propValue,
            propType,
            destProp;

        for (property in source) {
            propValue = source[property];
            propType = typeof propValue;
            if (propType === OBJECT && propValue !== null && propValue.constructor !== Array) {
                if (propValue instanceof Date) {
                    destination[property] = new Date(propValue.getTime());
                } else {
                    destProp = destination[property];
                    if (typeof (destProp) === OBJECT) {
                        destination[property] = destProp || {};
                    } else {
                        destination[property] = {};
                    }
                    deepExtendOne(destination[property], propValue);
                }
            } else if (propType !== UNDEFINED) {
                destination[property] = propValue;
            }
        }

        return destination;
    }

    /**
     * Contains results from feature detection.
     * @name kendo.support
     * @namespace Contains results from feature detection.
     */
    (function() {
        /**
         * Indicates the width of the browser scrollbar. A value of zero means that the browser does not show a visual representation of a scrollbar (i.e. mobile browsers).
         * @name kendo.support.scrollbar
         * @property {Boolean}
         */
        support.scrollbar = function() {
            var div = document.createElement("div"),
                result;

            div.style.cssText = "overflow:scroll;overflow-x:hidden;zoom:1;clear:both";
            div.innerHTML = "&nbsp;";
            document.body.appendChild(div);

            result = div.offsetWidth - div.scrollWidth;

            document.body.removeChild(div);
            return result;
        };

        var table = document.createElement("table");

        // Internet Explorer does not support setting the innerHTML of TBODY and TABLE elements
        try {
            table.innerHTML = "<tr><td></td></tr>";

            /**
             * Indicates whether the browser supports setting of the <tbody> innerHtml.
             * @name kendo.support.tbodyInnerHtml
             * @property {Boolean}
             */
            support.tbodyInnerHtml = true;
        } catch (e) {
            support.tbodyInnerHtml = false;
        }

        /**
         * Indicates whether the browser supports touch events.
         * @name kendo.support.touch
         * @property {Boolean}
         */
        support.touch = "ontouchstart" in window;
        support.pointers = navigator.msPointerEnabled;

        /**
         * Indicates whether the browser supports CSS transitions.
         * @name kendo.support.transitions
         * @property {Boolean}
         */
        var transitions = support.transitions = false;
        var transforms = support.transforms = false;

        /**
         * Indicates whether the browser supports hardware 3d transitions.
         * @name kendo.support.hasHW3D
         * @property {Boolean}
         */
        support.hasHW3D = ("WebKitCSSMatrix" in window && "m11" in new window.WebKitCSSMatrix()) || "MozPerspective" in document.documentElement.style || "msPerspective" in document.documentElement.style;
        support.hasNativeScrolling = typeof document.documentElement.style.webkitOverflowScrolling == "string";

        each([ "Moz", "webkit", "O", "ms" ], function () {
            var prefix = this.toString(),
                hasTransitions = typeof table.style[prefix + "Transition"] === STRING;

            if (hasTransitions || typeof table.style[prefix + "Transform"] === STRING) {
                var lowPrefix = prefix.toLowerCase();

                transforms = {
                    css: "-" + lowPrefix + "-",
                    prefix: prefix,
                    event: (lowPrefix === "o" || lowPrefix === "webkit") ? lowPrefix : ""
                };

                if (hasTransitions) {
                    transitions = transforms;
                    transitions.event = transitions.event ? transitions.event + "TransitionEnd" : "transitionend";
                }

                return false;
            }
        });

        support.transforms = transforms;
        support.transitions = transitions;

        /**
         * Indicates the browser device pixel ratio.
         * @name kendo.support.devicePixelRatio
         * @property {Float}
         */
        support.devicePixelRatio = window.devicePixelRatio === undefined ? 1 : window.devicePixelRatio;

        support.detectOS = function (ua) {
            var os = false, minorVersion, match = [],
                agentRxs = {
                    fire: /(Silk)\/(\d+)\.(\d+(\.\d+)?)/,
                    android: /(Android|Android.*(?:Opera|Firefox).*?\/)\s*(\d+)\.(\d+(\.\d+)?)/,
                    iphone: /(iPhone|iPod).*OS\s+(\d+)[\._]([\d\._]+)/,
                    ipad: /(iPad).*OS\s+(\d+)[\._]([\d_]+)/,
                    meego: /(MeeGo).+NokiaBrowser\/(\d+)\.([\d\._]+)/,
                    webos: /(webOS)\/(\d+)\.(\d+(\.\d+)?)/,
                    blackberry: /(BlackBerry).*?Version\/(\d+)\.(\d+(\.\d+)?)/,
                    playbook: /(PlayBook).*?Tablet\s*OS\s*(\d+)\.(\d+(\.\d+)?)/,
                    winphone: /(IEMobile)\/(\d+)\.(\d+(\.\d+)?)/,
                    windows: /(MSIE)\s+(\d+)\.(\d+(\.\d+)?)/
                },
                osRxs = {
                    ios: /^i(phone|pad|pod)$/i,
                    android: /^android|fire$/i,
                    blackberry: /^blackberry|playbook/i,
                    windows: /windows|winphone/
                },
                formFactorRxs = {
                    tablet: /playbook|ipad|fire/i
                },
                browserRxs = {
                    omini: /Opera\sMini/i,
                    omobile: /Opera\sMobi/i,
                    firefox: /Firefox|Fennec/i,
                    mobilesafari: /version\/.*safari/i,
                    webkit: /webkit/i,
                    ie: /MSIE|Windows\sPhone/i
                },
                testRx = function (agent, rxs, dflt) {
                    for (var rx in rxs) {
                        if (rxs.hasOwnProperty(rx) && rxs[rx].test(agent)) {
                            return rx;
                        }
                    }
                    return dflt !== undefined ? dflt : agent;
                };

            for (var agent in agentRxs) {
                if (agentRxs.hasOwnProperty(agent)) {
                    match = ua.match(agentRxs[agent]);
                    if (match) {
                        if (agent == "windows" && "plugins" in navigator) { return false; } // Break if not Metro/Mobile Windows

                        os = {};
                        os.device = agent;
                        os.tablet = testRx(agent, formFactorRxs, false);
                        os.browser = testRx(ua, browserRxs, "default");
                        os.name = testRx(agent, osRxs);
                        os[os.name] = true;
                        os.majorVersion = match[2];
                        os.minorVersion = match[3].replace("_", ".");
                        minorVersion = os.minorVersion.replace(".", "").substr(0, 2);
                        os.flatVersion = os.majorVersion + minorVersion + (new Array(3 - (minorVersion.length < 3 ? minorVersion.length : 2)).join("0"));
                        os.appMode = window.navigator.standalone || (/file|local/).test(window.location.protocol) || typeof window.PhoneGap !== UNDEFINED || typeof window.cordova !== UNDEFINED; // Use file protocol to detect appModes.

                        if (os.android && support.devicePixelRatio < 1.5 && (window.outerWidth > 800 || window.outerHeight > 800)) {
                            os.tablet = agent;
                        }

                        break;
                    }
                }
            }
            return os;
        };

        /**
         * Parses the mobile OS type and version from the browser user agent.
         * @name kendo.support.mobileOS
         */
        support.mobileOS = support.detectOS(navigator.userAgent);

        support.zoomLevel = function() {
            return support.touch ? (document.documentElement.clientWidth / window.innerWidth) : 1;
        };

        /**
         * Indicates the browser support for event capturing
         * @name kendo.support.eventCapture
         * @property {Boolean}
         */
        support.eventCapture = document.documentElement.addEventListener;

        /**
         * Indicates whether the browser supports input placeholder.
         * @name kendo.support.placeholder
         * @property {Boolean}
         */
        support.placeholder = "placeholder" in document.createElement("input");
        support.stableSort = (function() {
            var sorted = [0,1,2,3,4,5,6,7,8,9,10,11,12].sort(function() { return 0; } );
            return sorted[0] === 0 && sorted[1] === 1 && sorted[2] === 2 && sorted[3] === 3 && sorted[4] === 4 &&
                sorted[5] === 5 && sorted[6] === 6 && sorted[7] === 7 && sorted[8] === 8 &&
                sorted[9] === 9 && sorted[10] === 10 && sorted[11] === 11 && sorted[12] === 12;
        })();

    })();

    /**
     * Exposed by jQuery.
     * @ignore
     * @name jQuery.fn
     * @namespace Handy jQuery plug-ins that are used by all Kendo widgets.
     */

    function size(obj) {
        var result = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key) && key != "toJSON") { // Ignore fake IE7 toJSON.
                result++;
            }
        }

        return result;
    }

    function isNodeEmpty(element) {
        return $.trim($(element).contents().filter(function () { return this.nodeType != 8; }).html()) === "";
    }

    function getOffset(element, type) {
        if (!type) {
            type = "offset";
        }

        var result = element[type](),
            mobileOS = support.mobileOS;

        if (support.touch && mobileOS.ios && mobileOS.flatVersion < 410) { // Extra processing only in broken iOS'
            var offset = type == "offset" ? result : element.offset(),
                positioned = (result.left == offset.left && result.top == offset.top);

            if (positioned) {
                return {
                    top: result.top - window.scrollY,
                    left: result.left - window.scrollX
                };
            }
        }

        return result;
    }

    var directions = {
        left: { reverse: "right" },
        right: { reverse: "left" },
        down: { reverse: "up" },
        up: { reverse: "down" },
        top: { reverse: "bottom" },
        bottom: { reverse: "top" },
        "in": { reverse: "out" },
        out: { reverse: "in" }
    };

    function parseEffects(input) {
        var effects = {};

        each((typeof input === "string" ? input.split(" ") : input), function(idx) {
            effects[idx] = this;
        });

        return effects;
    }

    var fx = {
        promise: function (element, options) {
            if (options.show) {
                element.css({ display: element.data("olddisplay") || "block" }).css("display");
            }

            if (options.hide) {
                element.data("olddisplay", element.css("display")).hide();
            }

            if (options.init) {
                options.init();
            }

            if (options.completeCallback) {
                options.completeCallback(element); // call the external complete callback with the element
            }

            element.dequeue();
        },

        transitionPromise: function(element, destination, options) {
            var container = kendo.wrap(element);
            container.append(destination);

            element.hide();
            destination.show();

            if (options.completeCallback) {
                options.completeCallback(element); // call the external complete callback with the element
            }

            return element;
        }
    };

    function prepareAnimationOptions(options, duration, reverse, complete) {
        if (typeof options === STRING) {
            // options is the list of effect names separated by space e.g. animate(element, "fadeIn slideDown")

            // only callback is provided e.g. animate(element, options, function() {});
            if (isFunction(duration)) {
                complete = duration;
                duration = 400;
                reverse = false;
            }

            if (isFunction(reverse)) {
                complete = reverse;
                reverse = false;
            }

            if (typeof duration === BOOLEAN){
                reverse = duration;
                duration = 400;
            }

            options = {
                effects: options,
                duration: duration,
                reverse: reverse,
                complete: complete
            };
        }

        return extend({
            //default options
            effects: {},
            duration: 400, //jQuery default duration
            reverse: false,
            init: noop,
            teardown: noop,
            hide: false,
            show: false
        }, options, { completeCallback: options.complete, complete: noop }); // Move external complete callback, so deferred.resolve can be always executed.

    }

    function animate(element, options, duration, reverse, complete) {
        element.each(function (idx, el) { // fire separate queues on every element to separate the callback elements
            el = $(el);
            el.queue(function () {
                fx.promise(el, prepareAnimationOptions(options, duration, reverse, complete));
            });
        });

        return element;
    }

    function animateTo(element, destination, options, duration, reverse, complete) {
        return fx.transitionPromise(element, destination, prepareAnimationOptions(options, duration, reverse, complete));
    }

    extend($.fn, /** @lends jQuery.fn */{
        kendoStop: function(clearQueue, gotoEnd) {
            return this.stop(clearQueue, gotoEnd);
        },

        kendoAnimate: function(options, duration, reverse, complete) {
            return animate(this, options, duration, reverse, complete);
        },

        kendoAnimateTo: function(destination, options, duration, reverse, complete) {
            return animateTo(this, destination, options, duration, reverse, complete);
        }
    });

    function toggleClass(element, classes, options, add) {
        if (classes) {
            classes = classes.split(" ");

            each(classes, function(idx, value) {
                element.toggleClass(value, add);
            });
        }

        return element;
    }

    extend($.fn, /** @lends jQuery.fn */{
        kendoAddClass: function(classes, options){
            return toggleClass(this, classes, options, true);
        },
        kendoRemoveClass: function(classes, options){
            return toggleClass(this, classes, options, false);
        },
        kendoToggleClass: function(classes, options, toggle){
            return toggleClass(this, classes, options, toggle);
        }
    });

    var ampRegExp = /&/g,
        ltRegExp = /</g,
        gtRegExp = />/g;
    /**
     * Encodes HTML characters to entities.
     * @name kendo.htmlEncode
     * @function
     * @param {String} value The string that needs to be HTML encoded.
     * @returns {String} The encoded string.
     */
    function htmlEncode(value) {
        return ("" + value).replace(ampRegExp, "&amp;").replace(ltRegExp, "&lt;").replace(gtRegExp, "&gt;");
    }

    var touchLocation = function(e) {
        var originalEvent = typeof e.pageX == UNDEFINED ? e.originalEvent : e;
        return {
            idx: support.pointers ? originalEvent.pointerId : 0,
            x: originalEvent.pageX,
            y: originalEvent.pageY
        };
    };

    var eventTarget = function (e) {
        return e.target;
    };

    if (support.touch) {
        /** @ignore */
        touchLocation = function(e, id) {
            var changedTouches = e.changedTouches || e.originalEvent.changedTouches;

            if (id) {
                var output = null;
                each(changedTouches, function(idx, value) {
                    if (id == value.identifier) {
                        output = {
                            idx: value.identifier,
                            x: value.pageX,
                            y: value.pageY
                        };
                    }
                });
                return output;
            } else {
                return {
                    idx: changedTouches[0].identifier,
                    x: changedTouches[0].pageX,
                    y: changedTouches[0].pageY
                };
            }
        };

        eventTarget = function(e) {
            var touches = "originalEvent" in e ? e.originalEvent.changedTouches : "changedTouches" in e ? e.changedTouches : null;

            return touches ? document.elementFromPoint(touches[0].clientX, touches[0].clientY) : null;
        };

        each(["swipe", "swipeLeft", "swipeRight", "swipeUp", "swipeDown", "doubleTap", "tap"], function(m, value) {
            $.fn[value] = function(callback) {
                return this.bind(value, callback);
            };
        });
    }

    if (support.touch) {
        support.mousedown = "touchstart";
        support.mouseup = "touchend";
        support.mousemove = "touchmove";
        support.mousecancel = "touchcancel";
        support.resize = "orientationchange";
    } else if (support.pointers) {
        support.mousemove = "MSPointerMove";
        support.mousedown = "MSPointerDown";
        support.mouseup = "MSPointerUp";
        support.mousecancel = "MSPointerCancel";
        support.resize = "orientationchange resize";
    } else {
        support.mousemove = "mousemove";
        support.mousedown = "mousedown";
        support.mouseup = "mouseup";
        support.mousecancel = "mouseleave";
        support.resize = "resize";
    }


    var wrapExpression = function(members) {
        var result = "d",
            index,
            idx,
            length,
            member,
            count = 1;

        for (idx = 0, length = members.length; idx < length; idx++) {
            member = members[idx];
            if (member !== "") {
                index = member.indexOf("[");

                if (index !== 0) {
                    if (index == -1) {
                        member = "." + member;
                    } else {
                        count++;
                        member = "." + member.substring(0, index) + " || {})" + member.substring(index);
                    }
                }

                count++;
                result += member + ((idx < length - 1) ? " || {})" : ")");
            }
        }
        return new Array(count).join("(") + result;
    },
    localUrlRe = /^([a-z]+:)?\/\//i;

    extend(kendo, /** @lends kendo */ {
        /**
         * @name kendo.ui
         * @namespace Contains all classes for the Kendo UI widgets.
         */
        ui: kendo.ui || {},
        fx: kendo.fx || fx,
        data: kendo.data || {},
        mobile: kendo.mobile || {},
        dataviz: kendo.dataviz || {ui: {}},
        keys: {
            INSERT: 45,
            DELETE: 46,
            BACKSPACE: 8,
            TAB: 9,
            ENTER: 13,
            ESC: 27,
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            DOWN: 40,
            END: 35,
            HOME: 36,
            SPACEBAR: 32,
            PAGEUP: 33,
            PAGEDOWN: 34,
            F2: 113,
            F10: 121,
            F12: 123
        },
        support: support,
        animate: animate,
        ns: "",
        attr: function(value) {
            return "data-" + kendo.ns + value;
        },
        wrap: wrap,
        deepExtend: deepExtend,
        size: size,
        isNodeEmpty: isNodeEmpty,
        getOffset: getOffset,
        parseEffects: parseEffects,
        toggleClass: toggleClass,
        directions: directions,
        Observable: Observable,
        Class: Class,
        Template: Template,
        /**
         * Shorthand for {@link kendo.Template.compile}.
         * @name kendo.template
         * @function
         */
        template: proxy(Template.compile, Template),
        /**
         * Shorthand for {@link kendo.Template.render}.
         * @name kendo.render
         * @function
         */
        render: proxy(Template.render, Template),
        stringify: proxy(JSON.stringify, JSON),
        touchLocation: touchLocation,
        eventTarget: eventTarget,
        htmlEncode: htmlEncode,
        isLocalUrl: function(url) {
            return url && !localUrlRe.test(url);
        },
        /** @ignore */
        expr: function(expression, safe) {
            expression = expression || "";

            if (expression && expression.charAt(0) !== "[") {
                expression = "." + expression;
            }

            if (safe) {
                expression =  wrapExpression(expression.split("."));
            } else {
                expression = "d" + expression;
            }

            return expression;
        },
        /** @ignore */
        getter: function(expression, safe) {
            return getterCache[expression] = getterCache[expression] || new Function("d", "return " + kendo.expr(expression, safe));
        },
        /** @ignore */
        setter: function(expression) {
            return setterCache[expression] = setterCache[expression] || new Function("d,value", "d." + expression + "=value");
        },
        /** @ignore */
        accessor: function(expression) {
            return {
                get: kendo.getter(expression),
                set: kendo.setter(expression)
            };
        },
        /** @ignore */
        guid: function() {
            var id = "", i, random;

            for (i = 0; i < 32; i++) {
                random = math.random() * 16 | 0;

                if (i == 8 || i == 12 || i == 16 || i == 20) {
                    id += "-";
                }
                id += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
            }

            return id;
        },

        roleSelector: function(role) {
            return role.replace(/(\S+)/g, "[" + kendo.attr("role") + "=$1],").slice(0, -1);
        },

        /** @ignore */
        logToConsole: function(message) {
            var console = window.console;

            if (typeof(console) != "undefined" && console.log) {
                console.log(message);
            }
        }
    });

    var Widget = Observable.extend( /** @lends kendo.ui.Widget.prototype */ {
        /**
         * Initializes widget. Sets `element` and `options` properties.
         * @constructs
         * @class Represents a UI widget. Base class for all Kendo widgets
         * @extends kendo.Observable
         */
        init: function(element, options) {
            var that = this;

            that.element = $(element);

            Observable.fn.init.call(that);

            that.options = extend(true, {}, that.options, options);

            if (!that.element.attr(kendo.attr("role"))) {
                that.element.attr(kendo.attr("role"), (that.options.name || "").toLowerCase());
            }

            that.element.data("kendo" + that.options.prefix + that.options.name, that);

            that.bind(that.events, that.options);
        },

        events: [],

        options: {
            prefix: ""
        },

        setOptions: function(options) {
            $.extend(this.options, options);

            this.bind(this.events, options);
        }
    });

    kendo.notify = noop;

    var templateRegExp = /template$/i,
        jsonRegExp = /^\s*(?:\{(?:.|\n)*\}|\[(?:.|\n)*\])\s*$/,
        jsonFormatRegExp = /^\{(\d+)(:[^\}]+)?\}/,
        dashRegExp = /([A-Z])/g;

    function parseOption(element, option) {
        var value;

        if (option.indexOf("data") === 0) {
            option = option.substring(4);
            option = option.charAt(0).toLowerCase() + option.substring(1);
        }

        option = option.replace(dashRegExp, "-$1");
        value = element.getAttribute("data-" + kendo.ns + option);

        if (value === null) {
            value = undefined;
        } else if (value === "null") {
            value = null;
        } else if (value === "true") {
            value = true;
        } else if (value === "false") {
            value = false;
        } else if (!isNaN(parseFloat(value))) {
            value = parseFloat(value);
        } else if (jsonRegExp.test(value) && !jsonFormatRegExp.test(value)) {
            value = $.parseJSON(value);
        }

        return value;
    }

    function parseOptions(element, options) {
        var result = {},
            option,
            value;

        for (option in options) {
            value = parseOption(element, option);

            if (value !== undefined) {

                if (templateRegExp.test(option)) {
                    value = kendo.template($("#" + value).html());
                }

                result[option] = value;
            }
        }

        return result;
    }

    kendo.initWidget = function(element, options, roles) {
        var result,
            option,
            widget,
            idx,
            length,
            role,
            value,
            dataSource;

        // Preserve backwards compatibility with (element, options, namespace) signature, where namespace was kendo.ui
        if (!roles) {
            roles = kendo.ui.roles;
        } else if (roles.roles) {
            roles = roles.roles;
        }

        element = element.nodeType ? element : element[0];

        role = element.getAttribute("data-" + kendo.ns + "role");

        if (!role) {
            return;
        }

        widget = roles[role];

        if (!widget) {
            return;
        }

        dataSource = parseOption(element, "dataSource");

        options = $.extend({}, parseOptions(element, widget.fn.options), options);

        if (dataSource) {
            if (typeof dataSource === STRING) {
                options.dataSource = kendo.getter(dataSource)(window);
            } else {
                options.dataSource = dataSource;
            }
        }

        for (idx = 0, length = widget.fn.events.length; idx < length; idx++) {
            option = widget.fn.events[idx];

            value = parseOption(element, option);

            if (value !== undefined) {
                options[option] = kendo.getter(value)(window);
            }
        }

        result = $(element).data("kendo" + widget.fn.options.name);

        if (!result) {
            result = new widget(element, options);
        } else {
            result.setOptions(options);
        }

        return result;
    };

    kendo.init = function(element) {
        var namespaces = slice.call(arguments, 1),
            roles;

        if (!namespaces[0]) {
            namespaces = [kendo.ui, kendo.dataviz.ui];
        }

        roles = $.map(namespaces, function(namespace) { return namespace.roles; }).reverse();

        roles = extend.apply(null, [{}].concat(roles));

        $(element).find("[data-" + kendo.ns + "role]").andSelf().each(function(){
            kendo.initWidget(this, {}, roles);
        });
    };

    kendo.parseOptions = parseOptions;

    extend(kendo.ui, /** @lends kendo.ui */{
        Widget: Widget,
        roles: {},
        /**
         * Shows an overlay with a loading message, indicating that an action is in progress.
         * @name kendo.ui.progress
         * @function
         * @param {jQuery} container The container that will hold the overlay
         * @param {Boolean} toggle Whether the overlay should be shown or hidden
         */
        progress: function(container, toggle) {
            var mask = container.find(".k-loading-mask");

            if (toggle) {
                if (!mask.length) {
                    mask = $("<div class='k-loading-mask'><span class='k-loading-text'>Loading...</span><div class='k-loading-image'/><div class='k-loading-color'/></div>")
                        .width("100%").height("100%")
                        .prependTo(container)
                        .css({ top: container.scrollTop(), left: container.scrollLeft() });
                }
            } else if (mask) {
                mask.remove();
            }
        },
        /**
         * Helper method for writing new widgets.
         * Exposes a jQuery plug-in that will handle the widget creation and attach its client-side object in the appropriate data-* attribute.
         * @name kendo.ui.plugin
         * @function
         * @param {kendo.ui.Widget} widget The widget function.
         * @param {Object} register <kendo.ui> The object where the reference to the widget is recorded.
         * @param {Object} prefix <""> The plugin function prefix, e.g. "Mobile" will register "kendoMobileFoo".
         * @example
         * function TextBox(element, options);
         * kendo.ui.plugin(TextBox);
         *
         * // initialize a new TextBox for each input, with the given options object.
         * $("input").kendoTextBox({ });
         * // get the TextBox object and call the value API method
         * $("input").data("kendoTextBox").value();
         */
        plugin: function(widget, register, prefix) {
            var name = widget.fn.options.name,
                getter;

            register = register || kendo.ui;
            prefix = prefix || "";

            register[name] = widget;

            register.roles[name.toLowerCase()] = widget;

            getter = "getKendo" + prefix + name;
            name = "kendo" + prefix + name;

            $.fn[name] = function(options) {
                var value = this,
                    args;

                if (typeof options === STRING) {
                    args = slice.call(arguments, 1);

                    this.each(function(){
                        var widget = $.data(this, name),
                            method,
                            result;

                        if (!widget) {
                            throw new Error(kendo.format("Cannot call method '{0}' of {1} before it is initialized", options, name));
                        }

                        method = widget[options];

                        if (typeof method !== FUNCTION) {
                            throw new Error(kendo.format("Cannot find method '{0}' of {1}", options, name));
                        }

                        result = method.apply(widget, args);

                        if (result !== undefined) {
                            value = result;
                            return false;
                        }
                    });
                } else {
                    this.each(function() {
                        new widget(this, options);
                    });
                }

                return value;
            };

            $.fn[getter] = function() {
                return this.data(name);
            };
        }
    });

    var MobileWidget = Widget.extend(/** @lends kendo.mobile.ui.Widget.prototype */{
        /**
         * Initializes mobile widget. Sets `element` and `options` properties.
         * @constructs
         * @class Represents a mobile UI widget. Base class for all Kendo mobile widgets.
         * @extends kendo.ui.Widget
         */
        init: function(element, options) {
            Widget.fn.init.call(this, element, options);
            this.wrapper = this.element;
        },

        options: {
            prefix: "Mobile"
        },

        events: [],

        viewShow: $.noop,

        view: function() {
            var viewElement = this.element.closest(kendo.roleSelector("view") + "," + kendo.roleSelector("splitview"));
            return viewElement.data("kendoMobileView") || viewElement.data("kendoMobileSplitView");
        }
    });

    /**
     * @name kendo.mobile
     * @namespace This object contains all code introduced by the Kendo mobile suite, plus helper functions that are used across all mobile widgets.
     */
    extend(kendo.mobile, {
        init: function(element) {
            kendo.init(element, kendo.mobile.ui, kendo.ui, kendo.dataviz.ui);
        },

        /**
         * @name kendo.mobile.ui
         * @namespace Contains all classes for the Kendo Mobile UI widgets.
         */
        ui: {
            Widget: MobileWidget,
            roles: {},
            plugin: function(widget) {
                kendo.ui.plugin(widget, kendo.mobile.ui, "Mobile");
            }
        }
    });

    /**
     * Enables kinetic scrolling on touch devices
     * @name kendo.touchScroller
     * @function
     * @param {Selector} element The container element to enable scrolling for.
     */
    kendo.touchScroller = function(element, options) {
        if (support.touch && kendo.mobile.ui.Scroller && !element.data("kendoMobileScroller")) {
            element.kendoMobileScroller(options);
            return element.data("kendoMobileScroller");
        } else {
            return false;
        }
    };

    /**
     * Prevents the default event action. Should be supplied as an event callback
     * @name kendo.preventDefault
     * @function
     */
    kendo.preventDefault = function(e) {
        e.preventDefault();
    };

    /**
     * Retrieves the widget for a given element (if any)
     */
    kendo.widgetInstance = function(element, suite) {
        var widget = suite.roles[element.data(kendo.ns + "role")];

        if (widget) {
            return element.data("kendo" + widget.fn.options.prefix + widget.fn.options.name);
        }
    };

    /**
     * Binds to orientation change or resize (depending on the platform)
     * Abstracts problem with android triggering event before the dimensions have changed.
     * @function
     * @param {Function} callback The callback to be executed
     */
    kendo.onResize = function(callback) {
        var handler = callback;
        if (support.mobileOS.android) {
            handler = function() { setTimeout(callback, 200); };
        }

        $(window).on(support.resize, handler);
    };

    kendo.data = function(element, key) {
        return element.data(kendo.ns + key);
    };
})(jQuery);
(function($, undefined) {
    /**
     * @name kendo.fx
     * @namespace This object contains the fx library that is used by all widgets using animation.
     * If this file is not included, all animations will be disabled but the basic functionality preserved.
     */
    var kendo = window.kendo,
        fx = kendo.fx,
        each = $.each,
        extend = $.extend,
        proxy = $.proxy,
        size = kendo.size,
        browser = $.browser,
        support = kendo.support,
        transforms = support.transforms,
        transitions = support.transitions,
        scaleProperties = { scale: 0, scalex: 0, scaley: 0, scale3d: 0 },
        translateProperties = { translate: 0, translatex: 0, translatey: 0, translate3d: 0 },
        hasZoom = (typeof document.documentElement.style.zoom !== "undefined") && !transforms,
        matrix3dRegExp = /matrix3?d?\s*\(.*,\s*([\d\.\-]+)\w*?,\s*([\d\.\-]+)\w*?,\s*([\d\.\-]+)\w*?,\s*([\d\.\-]+)\w*?/i,
        cssParamsRegExp = /^(-?[\d\.\-]+)?[\w\s]*,?\s*(-?[\d\.\-]+)?[\w\s]*/i,
        translateXRegExp = /translatex?$/i,
        oldEffectsRegExp = /(zoom|fade|expand)(\w+)/,
        singleEffectRegExp = /(zoom|fade|expand)/,
        unitRegExp = /[xy]$/i,
        transformProps = ["perspective", "rotate", "rotatex", "rotatey", "rotatez", "rotate3d", "scale", "scalex", "scaley", "scalez", "scale3d", "skew", "skewx", "skewy", "translate", "translatex", "translatey", "translatez", "translate3d", "matrix", "matrix3d"],
        transform2d = ["rotate", "scale", "scalex", "scaley", "skew", "skewx", "skewy", "translate", "translatex", "translatey", "matrix"],
        transform2units = { "rotate": "deg", scale: "", skew: "px", translate: "px" },
        cssPrefix = transforms.css,
        round = Math.round,
        BLANK = "",
        PX = "px",
        NONE = "none",
        AUTO = "auto",
        WIDTH = "width",
        HEIGHT = "height",
        HIDDEN = "hidden",
        ORIGIN = "origin",
        ABORT_ID = "abortId",
        OVERFLOW = "overflow",
        TRANSLATE = "translate",
        TRANSITION = cssPrefix + "transition",
        TRANSFORM = cssPrefix + "transform",
        PERSPECTIVE = cssPrefix + "perspective",
        BACKFACE = cssPrefix + "backface-visibility";

    kendo.directions = {
        left: {
            reverse: "right",
            property: "left",
            transition: "translatex",
            vertical: false,
            modifier: -1
        },
        right: {
            reverse: "left",
            property: "left",
            transition: "translatex",
            vertical: false,
            modifier: 1
        },
        down: {
            reverse: "up",
            property: "top",
            transition: "translatey",
            vertical: true,
            modifier: 1
        },
        up: {
            reverse: "down",
            property: "top",
            transition: "translatey",
            vertical: true,
            modifier: -1
        },
        top: {
            reverse: "bottom"
        },
        bottom: {
            reverse: "top"
        },
        "in": {
            reverse: "out",
            modifier: -1
        },
        out: {
            reverse: "in",
            modifier: 1
        }
    };

    extend($.fn, {
        kendoStop: function(clearQueue, gotoEnd) {
            if (transitions) {
                return kendo.fx.stopQueue(this, clearQueue || false, gotoEnd || false);
            } else {
                return this.stop(clearQueue, gotoEnd);
            }
        }
    });

    /* jQuery support for all transform animations (FF 3.5/3.6, Opera 10.x, IE9 */

    if (transforms && !transitions) {
        each(transform2d, function(idx, value) {
            $.fn[value] = function(val) {
                if (typeof val == "undefined") {
                    return animationProperty(this, value);
                } else {
                    var that = $(this)[0],
                        transformValue = value + "(" + val + transform2units[value.replace(unitRegExp, "")] + ")";

                    if (that.style.cssText.indexOf(TRANSFORM) == -1) {
                        $(this).css(TRANSFORM, transformValue);
                    } else {
                        that.style.cssText = that.style.cssText.replace(new RegExp(value + "\\(.*?\\)", "i"), transformValue);
                    }
                }
                return this;
            };

            $.fx.step[value] = function (fx) {
                $(fx.elem)[value](fx.now);
            };
        });

        var curProxy = $.fx.prototype.cur;
        $.fx.prototype.cur = function () {
            if (transform2d.indexOf(this.prop) != -1) {
                return parseFloat($(this.elem)[this.prop]());
            }

            return curProxy.apply(this, arguments);
        };
    }

    kendo.toggleClass = function(element, classes, options, add) {
        if (classes) {
            classes = classes.split(" ");

            if (transitions) {
                options = extend({
                    exclusive: "all",
                    duration: 400,
                    ease: "ease-out"
                }, options);

                element.css(TRANSITION, options.exclusive + " " + options.duration + "ms " + options.ease);
                setTimeout(function() {
                    element.css(TRANSITION, "").css(HEIGHT);
                }, options.duration); // TODO: this should fire a kendoAnimate session instead.
            }

            each(classes, function(idx, value) {
                element.toggleClass(value, add);
            });
        }

        return element;
    };

    kendo.parseEffects = function(input, mirror) {
        var effects = {};

        if (typeof input === "string") {
            each(input.split(" "), function(idx, value) {
                var redirectedEffect = !singleEffectRegExp.test(value),
                    resolved = value.replace(oldEffectsRegExp, function(match, $1, $2) {
                        return $1 + ":" + $2.toLowerCase();
                    }), // Support for old zoomIn/fadeOut style, now deprecated.
                    effect = resolved.split(":"),
                    direction = effect[1],
                    effectBody = {};

                if (effect.length > 1) {
                    effectBody.direction = (mirror && redirectedEffect ? kendo.directions[direction].reverse : direction);
                }

                effects[effect[0]] = effectBody;
            });
        } else {
            each(input, function(idx) {
                var direction = this.direction;

                if (direction && mirror && !singleEffectRegExp.test(idx)) {
                    this.direction = kendo.directions[direction].reverse;
                }

                effects[idx] = this;
            });
        }

        return effects;
    };

    function parseInteger(value) {
        return parseInt(value, 10);
    }

    function parseCSS(element, property) {
        return parseInteger(element.css(property));
    }

    function getComputedStyles(element, properties) {
        var styles = {};

        if (properties) {
            if (document.defaultView && document.defaultView.getComputedStyle) {
                var computedStyle = document.defaultView.getComputedStyle(element, "");

                each(properties, function(idx, value) {
                    styles[value] = computedStyle.getPropertyValue(value);
                });
            } else
                if (element.currentStyle) { // Not really needed
                    var style = element.currentStyle;

                    each(properties, function(idx, value) {
                        styles[value] = style[value.replace(/\-(\w)/g, function (strMatch, g1) { return g1.toUpperCase(); })];
                    });
                }
        } else {
            styles = document.defaultView.getComputedStyle(element, "");
        }

        return styles;
    }

    function slideToSlideIn(options) {
      options.effects.slideIn = options.effects.slide;
      delete options.effects.slide;
      delete options.complete;
      return options;
    }

    function parseTransitionEffects(options) {
        var effects = options.effects,
            mirror;

        if (effects === "zoom") {
            effects = "zoomIn fadeIn";
        }
        if (effects === "slide") {
            effects = "slide:left";
        }
        if (effects === "fade") {
            effects = "fadeIn";
        }
        if (effects === "overlay") {
            effects = "slideIn:left";
        }
        if (/^overlay:(.+)$/.test(effects)) {
            effects = "slideIn:" + RegExp.$1;
        }

        mirror = options.reverse && /^(slide:)/.test(effects);

        if (mirror) {
            delete options.reverse;
        }

        options.effects = $.extend(kendo.parseEffects(effects, mirror), {show: true});

        return options;
    }

    function keys(obj) {
        var acc = [];
        for (var propertyName in obj) {
            acc.push(propertyName);
        }
        return acc;
    }

    function stopTransition(element, transition) {
        if (element.data(ABORT_ID)) {
            clearTimeout(element.data(ABORT_ID));
            element.removeData(ABORT_ID);
        }

        element.css(TRANSITION, "").css(TRANSITION);
        element.dequeue();
        transition.complete.call(element);
    }

    function activateTask(currentTransition) {
        var element = currentTransition.object, delay = 0;

        if (!currentTransition) {
            return;
        }

        element.css(currentTransition.setup).css(TRANSITION);
        element.css(currentTransition.CSS).css(TRANSFORM);

        if (browser.mozilla) {
            element.one(transitions.event, function () { stopTransition(element, currentTransition); } );
            delay = 50;
        }
        element.data(ABORT_ID, setTimeout(stopTransition, currentTransition.duration + delay, element, currentTransition));
    }

    function strip3DTransforms(properties) {
        for (var key in properties) {
            if (transformProps.indexOf(key) != -1 && transform2d.indexOf(key) == -1) {
                delete properties[key];
            }
        }

        return properties;
    }

    function evaluateCSS(element, properties, options) {
        var key, value;

        for (key in properties) {
            if ($.isFunction(properties[key])) {
                value = properties[key](element, options);
                if (value !== undefined) {
                    properties[key] = value;
                } else {
                    delete properties[key];
                }
            }

        }

        return properties;
    }

    function normalizeCSS(element, properties, options) {
        var transformation = [], cssValues = {}, lowerKey, key, value, exitValue, isTransformed;

        for (key in properties) {
            lowerKey = key.toLowerCase();
            isTransformed = transforms && transformProps.indexOf(lowerKey) != -1;

            if (!support.hasHW3D && isTransformed && transform2d.indexOf(lowerKey) == -1) {
                delete properties[key];
            } else {
                exitValue = false;

                if ($.isFunction(properties[key])) {
                    value = properties[key](element, options);
                    if (value !== undefined) {
                        exitValue = value;
                    }
                } else {
                    exitValue = properties[key];
                }

                if (exitValue !== false) {
                    if (isTransformed) {
                        transformation.push(key + "(" + exitValue + ")");
                    } else {
                        cssValues[key] = exitValue;
                    }
                }
            }
        }

        if (transformation.length) {
            cssValues[TRANSFORM] = transformation.join(" ");
        }

        return cssValues;
    }

    if (transitions) {

        extend(kendo.fx, {
            transition: function(element, properties, options) {

                options = extend({
                        duration: 200,
                        ease: "ease-out",
                        complete: null,
                        exclusive: "all"
                    },
                    options
                );

                options.duration = $.fx ? $.fx.speeds[options.duration] || options.duration : options.duration;

                var css = normalizeCSS(element, properties, options),
                    currentTask = {
                        keys: keys(css),
                        CSS: css,
                        object: element,
                        setup: {},
                        duration: options.duration,
                        complete: options.complete
                    };
                currentTask.setup[TRANSITION] = options.exclusive + " " + options.duration + "ms " + options.ease;

                var oldKeys = element.data("keys") || [];
                $.merge(oldKeys, currentTask.keys);
                element.data("keys", $.unique(oldKeys));

                activateTask(currentTask);
            },

            stopQueue: function(element, clearQueue, gotoEnd) {

                if (element.data(ABORT_ID)) {
                    clearTimeout(element.data(ABORT_ID));
                    element.removeData(ABORT_ID);
                }

                var that = this, cssValues,
                    taskKeys = element.data("keys"),
                    retainPosition = (gotoEnd === false && taskKeys);

                if (retainPosition) {
                    cssValues = getComputedStyles(element[0], taskKeys);
                }

                element.css(TRANSITION, "").css(TRANSITION);

                if (retainPosition) {
                    element.css(cssValues);
                }

                element.removeData("keys");

                if (that.complete) {
                    that.complete.call(element);
                }

                element.stop(clearQueue);
                return element;
            }

        });
    }

    function animationProperty(element, property) {
        if (transforms) {
            var transform = element.css(TRANSFORM);
            if (transform == NONE) {
                return property == "scale" ? 1 : 0;
            }

            var match = transform.match(new RegExp(property + "\\s*\\(([\\d\\w\\.]+)")),
                computed = 0;

            if (match) {
                computed = parseInteger(match[1]);
            } else {
                match = transform.match(matrix3dRegExp) || [0, 0, 0, 0, 0];
                property = property.toLowerCase();

                if (translateXRegExp.test(property)) {
                    computed = parseFloat(match[3] / match[2]);
                } else if (property == "translatey") {
                    computed = parseFloat(match[4] / match[2]);
                } else if (property == "scale") {
                    computed = parseFloat(match[2]);
                } else if (property == "rotate") {
                    computed = parseFloat(Math.atan2(match[2], match[1]));
                }
            }

            return computed;
        } else {
            return parseFloat(element.css(property));
        }
    }

    function initDirection (element, direction, reverse) {
        var real = kendo.directions[direction],
            dir = reverse ? kendo.directions[real.reverse] : real;

        return { direction: dir, offset: -dir.modifier * (dir.vertical ? element.outerHeight() : element.outerWidth()) };
    }

    kendo.fx.promise = function(element, options) {
        var promises = [], effects;

        effects = kendo.parseEffects(options.effects);
        options.effects = effects;

        element.data("animating", true);

        var props = { keep: [], restore: [] }, css = {}, target,
            methods = { setup: [], teardown: [] }, properties = {},

            // create a promise for each effect
            promise = $.Deferred(function(deferred) {
                if (size(effects)) {
                    var opts = extend({}, options, { complete: deferred.resolve });

                    each(effects, function(effectName, settings) {
                        var effect = kendo.fx[effectName];

                        if (effect) {
                            var dir = kendo.directions[settings.direction];
                            if (settings.direction && dir) {
                                settings.direction = (options.reverse ? dir.reverse : settings.direction);
                            }

                            opts = extend(true, opts, settings);

                            each(methods, function (idx) {
                                if (effect[idx]) {
                                    methods[idx].push(effect[idx]);
                                }
                            });

                            each(props, function(idx) {
                                if (effect[idx]) {
                                    $.merge(props[idx], effect[idx]);
                                }
                            });

                            if (effect.css) {
                                css = extend(css, effect.css);
                            }
                        }
                    });

                    if (methods.setup.length) {
                        each ($.unique(props.keep), function(idx, value) {
                            if (!element.data(value)) {
                                element.data(value, element.css(value));
                            }
                        });

                        if (options.show) {
                            css = extend(css, { display: element.data("olddisplay") || "block" }); // Add show to the set
                        }

                        if (transforms && !options.reset) {
                            css = evaluateCSS(element, css, opts);

                            target = element.data("targetTransform");

                            if (target) {
                                css = extend(target, css);
                            }
                        }
                        css = normalizeCSS(element, css, opts);

                        if (transforms && !transitions) {
                            css = strip3DTransforms(css);
                        }

                        element.css(css)
                               .css(TRANSFORM); // Nudge

                        each (methods.setup, function() { properties = extend(properties, this(element, opts)); });

                        if (kendo.fx.animate) {
                            options.init();
                            element.data("targetTransform", properties);
                            kendo.fx.animate(element, properties, opts);
                        }

                        return;
                    }
                } else if (options.show) {
                    element.css({ display: element.data("olddisplay") || "block" }).css("display");
                    options.init();
                }

                deferred.resolve();
            }).promise();

        promises.push(promise);

        //wait for all effects to complete
        $.when.apply(null, promises).then(function() {
            element
                .removeData("animating")
                .dequeue(); // call next animation from the queue

            if (options.hide) {
                element.data("olddisplay", element.css("display")).hide();
            }

            if (size(effects)) {
                var restore = function() {
                    each ($.unique(props.restore), function(idx, value) {
                        element.css(value, element.data(value));
                    });
                };

                restore();
                if (hasZoom && !transforms) {
                    setTimeout(restore, 0); // Again jQuery callback in IE8-.
                }

                each(methods.teardown, function() { this(element, options); }); // call the internal completion callbacks
            }

            if (options.completeCallback) {
                options.completeCallback(element); // call the external complete callback with the element
            }
        });
    };

    kendo.fx.transitionPromise = function(element, destination, options) {
        kendo.fx.animateTo(element, destination, options);
        return element;
    };

    extend(kendo.fx, {
        animate: function(elements, properties, options) {
            var useTransition = options.transition !== false;
            delete options.transition;

            if (transitions && "transition" in fx && useTransition) {
                fx.transition(elements, properties, options);
            } else {
                if (transforms) {
                    elements.animate(strip3DTransforms(properties), { queue: false, show: false, hide: false, duration: options.duration, complete: options.complete }); // Stop animate from showing/hiding the element to be able to hide it later on.
                } else {
                    elements.each(function() {
                        var element = $(this),
                            multiple = {};

                        each(transformProps, function(idx, value) { // remove transforms to avoid IE and older browsers confusion
                            var params,
                                currentValue = properties ? properties[value]+ " " : null; // We need to match

                            if (currentValue) {
                                var single = properties;

                                if (value in scaleProperties && properties[value] !== undefined) {
                                    params = currentValue.match(cssParamsRegExp);
                                    if (hasZoom) {
                                        var half = (1 - params[1]) / 2;
                                        extend(single, {
                                                           zoom: +params[1],
                                                           marginLeft: element.width() * half,
                                                           marginTop: element.height() * half
                                                       });
                                    } else if (transforms) {
                                        extend(single, {
                                                           scale: +params[0]
                                                       });
                                    }
                                } else {
                                    if (value in translateProperties && properties[value] !== undefined) {
                                        var position = element.css("position"),
                                            isFixed = (position == "absolute" || position == "fixed");

                                        if (!element.data(TRANSLATE)) {
                                            if (isFixed) {
                                                element.data(TRANSLATE, {
                                                    top: parseCSS(element, "top") || 0,
                                                    left: parseCSS(element, "left") || 0,
                                                    bottom: parseCSS(element, "bottom"),
                                                    right: parseCSS(element, "right")
                                                });
                                            } else {
                                                element.data(TRANSLATE, {
                                                    top: parseCSS(element, "marginTop") || 0,
                                                    left: parseCSS(element, "marginLeft") || 0
                                                });
                                            }
                                        }

                                        var originalPosition = element.data(TRANSLATE);

                                        params = currentValue.match(cssParamsRegExp);
                                        if (params) {

                                            var dX = value == TRANSLATE + "y" ? +null : +params[1],
                                                dY = value == TRANSLATE + "y" ? +params[1] : +params[2];

                                            if (isFixed) {
                                                if (!isNaN(originalPosition.right)) {
                                                    if (!isNaN(dX)) { extend(single, { right: originalPosition.right - dX }); }
                                                } else {
                                                    if (!isNaN(dX)) { extend(single, { left: originalPosition.left + dX }); }
                                                }

                                                if (!isNaN(originalPosition.bottom)) {
                                                    if (!isNaN(dY)) { extend(single, { bottom: originalPosition.bottom - dY }); }
                                                } else {
                                                    if (!isNaN(dY)) { extend(single, { top: originalPosition.top + dY }); }
                                                }
                                            } else {
                                                if (!isNaN(dX)) { extend(single, { marginLeft: originalPosition.left + dX }); }
                                                if (!isNaN(dY)) { extend(single, { marginTop: originalPosition.top + dY }); }
                                            }
                                        }
                                    }
                                }

                                if (!transforms && value != "scale" && value in single) {
                                    delete single[value];
                                }

                                if (single) {
                                    extend(multiple, single);
                                }
                            }
                        });

                        if (browser.msie) {
                            delete multiple.scale;
                        }

                        element.animate(multiple, { queue: false, show: false, hide: false, duration: options.duration, complete: options.complete }); // Stop animate from showing/hiding the element to be able to hide it later on.
                    });
                }
            }
        },

        animateTo: function(element, destination, options) {
            var direction,
                commonParent = element.parents().filter(destination.parents()).first(),
                originalOverflow;

            options = parseTransitionEffects(options);
            if (!support.mobileOS.android) {
                originalOverflow = commonParent.css(OVERFLOW);
                commonParent.css(OVERFLOW, "hidden");
            }

            $.each(options.effects, function(name, definition) {
                direction = direction || definition.direction;
            });

            function complete(animatedElement) {
                destination[0].style.cssText = "";
                element[0].style.cssText = ""; // Removing the whole style attribute breaks Android.
                if (!support.mobileOS.android) {
                    commonParent.css(OVERFLOW, originalOverflow);
                }
                if (options.completeCallback) {
                    options.completeCallback.call(element, animatedElement);
                }
            }

            options.complete = browser.msie ? function() { setTimeout(complete, 0); } : complete;
            options.reset = true; // Reset transforms if there are any.

            if ("slide" in options.effects) {
                element.kendoAnimate(options);
                destination.kendoAnimate(slideToSlideIn(options));
            } else {
                (options.reverse ? element : destination).kendoAnimate(options);
            }
        },

        fade: {
            keep: [ "opacity" ],
            css: {
                opacity: function(element, options) {
                    var opacity = element[0].style.opacity;
                    return options.effects.fade.direction == "in" && (!opacity || opacity == 1) ? 0 : 1;
                }
            },
            restore: [ "opacity" ],
            setup: function(element, options) {
                return extend({ opacity: options.effects.fade.direction == "out" ? 0 : 1 }, options.properties);
            }
        },
        zoom: {
            css: {
                scale: function(element, options) {
                    var scale = animationProperty(element, "scale");
                    return options.effects.zoom.direction == "in" ? (scale != 1 ? scale : "0.01") : 1;
                },
                zoom: function(element, options) {
                    var zoom = element[0].style.zoom;
                    return options.effects.zoom.direction == "in" && hasZoom ? (zoom ? zoom : "0.01") : undefined;
                }
            },
            setup: function(element, options) {
                var reverse = options.effects.zoom.direction == "out";

                if (hasZoom) {
                    var version = browser.version,
                        style = element[0].currentStyle,
                        width = style.width.indexOf("%") != -1 ? element.parent().width() : element.width(),
                        height = style.height.indexOf("%") != -1 ? element.parent().height() : parseInteger(style.height),
                        half = version < 9 && options.effects.fade ? 0 : (1 - (parseInteger(element.css("zoom")) / 100)) / 2; // Kill margins in IE7/8 if using fade

                    element.css({
                        marginLeft: width * (version < 8 ? 0 : half),
                        marginTop: height * half
                    });
                }

                return extend({ scale: reverse ? 0.01 : 1 }, options.properties);
            }
        },
        slide: {
            setup: function(element, options) {
                var reverse = options.reverse, extender = {},
                    init = initDirection(element, options.effects.slide.direction, reverse),
                    property = transforms && options.transition !== false ? init.direction.transition : init.direction.property;

                init.offset /= -(options.divisor || 1);
                if (!reverse) {
                    var origin = element.data(ORIGIN);
                    if (!origin && origin !== 0) {
                        element.data(ORIGIN, animationProperty(element, property));
                    }
                }

                extender[property] = reverse ? (element.data(ORIGIN) || 0) : (element.data(ORIGIN) || 0) + init.offset + PX;

                return extend(extender, options.properties);
            }
        },
        slideMargin: {
            setup: function(element, options) {
                var origin = element.data(ORIGIN),
                    offset = options.offset, margin,
                    extender = {}, reverse = options.reverse;

                if (!reverse && !origin && origin !== 0) {
                    element.data(ORIGIN, parseFloat(element.css("margin-" + options.axis)));
                }

                margin = (element.data(ORIGIN) || 0);
                extender["margin-" + options.axis] = !reverse ? margin + offset : margin;
                return extend(extender, options.properties);
            }
        },
        slideTo: {
            setup: function(element, options) {
                var offset = (options.offset+"").split(","),
                    extender = {}, reverse = options.reverse;

                if (transforms && options.transition !== false) {
                    extender.translatex = !reverse ? offset[0] : 0;
                    extender.translatey = !reverse ? offset[1] : 0;
                } else {
                    extender.left = !reverse ? offset[0] : 0;
                    extender.top = !reverse ? offset[1] : 0;
                }
                element.css("left");

                return extend(extender, options.properties);
            }
        },
        slideIn: {
            css: {
                translatex: function (element, options) {
                    var init = initDirection(element, options.effects.slideIn.direction, options.reverse);
                    return init.direction.transition == "translatex" ? (!options.reverse ? init.offset : 0) + PX : undefined;
                },
                translatey: function (element, options) {
                    var init = initDirection(element, options.effects.slideIn.direction, options.reverse);
                    return init.direction.transition == "translatey" ? (!options.reverse ? init.offset : 0) + PX : undefined;
                }
            },
            setup: function(element, options) {
                var reverse = options.reverse,
                    init = initDirection(element, options.effects.slideIn.direction, reverse),
                    extender = {};

                if (transforms && options.transition !== false) {
                    extender[init.direction.transition] = (reverse ? init.offset : 0) + PX;
                } else {
                    if (!reverse) {
                        element.css(init.direction.property, init.offset + PX);
                    }
                    extender[init.direction.property] = (reverse ? init.offset : 0) + PX;
                    element.css(init.direction.property);
                }

                return extend(extender, options.properties);
            }
        },
        expand: {
            keep: [ OVERFLOW ],
            css: { overflow: HIDDEN },
            restore: [ OVERFLOW ],
            setup: function(element, options) {
                var reverse = options.reverse,
                    direction = options.effects.expand.direction,
                    property = (direction ? direction == "vertical" : true) ? HEIGHT : WIDTH,
                    setLength = element[0].style[property],
                    oldLength = element.data(property),
                    length = parseFloat(oldLength || setLength) || round(element.css(property, AUTO )[property]()),
                    completion = {};

                completion[property] = (reverse ? 0 : length) + PX;
                element.css(property, reverse ? length : 0).css(property);
                if (oldLength === undefined) {
                    element.data(property, setLength);
                }

                return extend(completion, options.properties);
            },
            teardown: function(element, options) {
                var direction = options.effects.expand.direction,
                    property = (direction ? direction == "vertical" : true) ? HEIGHT : WIDTH,
                    length = element.data(property);
                if (length == AUTO || length === BLANK) {
                    setTimeout(function() { element.css(property, AUTO).css(property); }, 0); // jQuery animate complete callback in IE is called before the last animation step!
                }
            }
        },
        flip: {
            css: {
                rotatex: function (element, options) {
                    return options.effects.flip.direction == "vertical" ? options.reverse ? "180deg" : "0deg" : undefined;
                },
                rotatey: function (element, options) {
                    return options.effects.flip.direction == "horizontal" ? options.reverse ? "180deg" : "0deg" : undefined;
                }
            },
            setup: function(element, options) {
                var rotation = options.effects.flip.direction == "horizontal" ? "rotatey" : "rotatex",
                    reverse = options.reverse, parent = element.parent(),
                    degree = options.degree, face = options.face, back = options.back,
                    faceRotation = rotation + (reverse ? "(180deg)" : "(0deg)"),
                    backRotation = rotation + (reverse ? "(0deg)" : "(180deg)"),
                    completion = {};

                if (support.hasHW3D) {
                    if (parent.css(PERSPECTIVE) == NONE) {
                        parent.css(PERSPECTIVE, 500);
                    }

                    element.css(cssPrefix + "transform-style", "preserve-3d");
                    face.css(BACKFACE, HIDDEN).css(TRANSFORM, faceRotation).css("z-index", reverse ? 0 : -1);
                    back.css(BACKFACE, HIDDEN).css(TRANSFORM, backRotation).css("z-index", reverse ? -1 : 0);
                    completion[rotation] = (reverse ? "-" : "") + (degree ? degree : 180) + "deg";
                } else {
                    if (kendo.size(options.effects) == 1) {
                        options.duration = 0;
                    }
                }
                face.show();
                back.show();

                return extend(completion, options.properties);
            },
            teardown: function(element, options) {
                options[options.reverse ? "back" : "face"].hide();

                if (support.hasHW3D) {
                    $().add(options.face).add(options.back).add(element)
                        .css(BACKFACE, "");
                }
            }
        },
        simple: {
            setup: function(element, options) {
                return options.properties;
            }
        }
    });

    kendo.fx.expandVertical = kendo.fx.expand; // expandVertical is deprecated.

    var animationFrame  = window.requestAnimationFrame       ||
                          window.webkitRequestAnimationFrame ||
                          window.mozRequestAnimationFrame    ||
                          window.oRequestAnimationFrame      ||
                          window.msRequestAnimationFrame     ||
                          function(callback){ setTimeout(callback, 1000 / 60); };

    var Animation = kendo.Class.extend({
        init: function() {
            var that = this;
            that._tickProxy = proxy(that._tick, that);
            that._started = false;
        },

        tick: $.noop,
        done: $.noop,
        onEnd: $.noop,
        onCancel: $.noop,

        start: function() {
            this._started = true;
            animationFrame(this._tickProxy);
        },

        cancel: function() {
            this._started = false;
            this.onCancel();
        },

        _tick: function() {
            var that = this;
            if (!that._started) { return; }

            that.tick();

            if (!that.done()) {
                animationFrame(that._tickProxy);
            } else {
                that._started = false;
                that.onEnd();
            }
        }
    });

    var Transition = Animation.extend({
        init: function(options) {
            var that = this;
            extend(that, options);
            Animation.fn.init.call(that);
        },

        done: function() {
            return this.timePassed() >= this.duration;
        },

        timePassed: function() {
            return Math.min(this.duration, (+new Date()) - this.startDate);
        },

        moveTo: function(options) {
            var that = this,
                movable = that.movable;

            that.initial = movable[that.axis];
            that.delta = options.location - that.initial;

            that.duration = options.duration || 300;

            that.tick = that._easeProxy(options.ease);

            that.startDate = +new Date();
            that.start();
        },

        _easeProxy: function(ease) {
            var that = this;

            return function() {
                that.movable.moveAxis(that.axis, ease(that.timePassed(), that.initial, that.delta, that.duration));
            };
        }
    });

    extend(Transition, {
        easeOutExpo: function (t, b, c, d) {
            return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
        },

        easeOutBack: function (t, b, c, d, s) {
            s = 1.70158;
            return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
        }
    });

    fx.Animation = Animation;
    fx.Transition = Transition;
})(jQuery);
(function($, undefined) {
    var kendo = window.kendo,
        extend = $.extend,
        odataFilters = {
            eq: "eq",
            neq: "ne",
            gt: "gt",
            gte: "ge",
            lt: "lt",
            lte: "le",
            contains : "substringof",
            endswith: "endswith",
            startswith: "startswith"
        },
        mappers = {
            pageSize: $.noop,
            page: $.noop,
            filter: function(params, filter) {
                if (filter) {
                    params.$filter = toOdataFilter(filter);
                }
            },
            sort: function(params, orderby) {
                var expr = $.map(orderby, function(value) {
                    var order = value.field.replace(/\./g, "/");

                    if (value.dir === "desc") {
                        order += " desc";
                    }

                    return order;
                }).join(",");

                if (expr) {
                    params.$orderby = expr;
                }
            },
            skip: function(params, skip) {
                if (skip) {
                    params.$skip = skip;
                }
            },
            take: function(params, take) {
                if (take) {
                    params.$top = take;
                }
            }
        },
        defaultDataType = {
            read: {
                dataType: "jsonp"
            }
        };

    function toOdataFilter(filter) {
        var result = [],
            logic = filter.logic || "and",
            idx,
            length,
            field,
            type,
            format,
            operator,
            value,
            ignoreCase,
            filters = filter.filters;

        for (idx = 0, length = filters.length; idx < length; idx++) {
            filter = filters[idx];
            field = filter.field;
            value = filter.value;
            operator = filter.operator;

            if (filter.filters) {
                filter = toOdataFilter(filter);
            } else {
                ignoreCase = filter.ignoreCase;
                field = field.replace(/\./g, "/");
                filter = odataFilters[operator];

                if (filter && value !== undefined) {
                    type = $.type(value);
                    if (type === "string") {
                        format = "'{1}'";
                        value = value.replace(/'/g, "''");

                        if (ignoreCase === true) {
                            field = "tolower(" + field + ")";
                        }

                    } else if (type === "date") {
                        format = "datetime'{1:yyyy-MM-ddTHH:mm:ss}'";
                    } else {
                        format = "{1}";
                    }

                    if (filter.length > 3) {
                        if (filter !== "substringof") {
                            format = "{0}({2}," + format + ")";
                        } else {
                            format = "{0}(" + format + ",{2})";
                        }
                    } else {
                        format = "{2} {0} " + format;
                    }

                    filter = kendo.format(format, filter, value, field);
                }
            }

            result.push(filter);
        }

        filter = result.join(" " + logic + " ");

        if (result.length > 1) {
            filter = "(" + filter + ")";
        }

        return filter;
    }

    extend(true, kendo.data, {
        schemas: {
            odata: {
                type: "json",
                data: function(data) {
                    return data.d.results || [data.d];
                },
                total: "d.__count"
            }
        },
        transports: {
            odata: {
                read: {
                    cache: true, // to prevent jQuery from adding cache buster
                    dataType: "jsonp",
                    jsonp: "$callback"
                },
                update: {
                    cache: true,
                    dataType: "json",
                    contentType: "application/json", // to inform the server the the request body is JSON encoded
                    type: "PUT" // can be PUT or MERGE
                },
                create: {
                    cache: true,
                    dataType: "json",
                    contentType: "application/json",
                    type: "POST" // must be POST to create new entity
                },
                destroy: {
                    cache: true,
                    dataType: "json",
                    type: "DELETE"
                },
                parameterMap: function(options, type) {
                    var params,
                        value,
                        option,
                        dataType;

                    options = options || {};
                    type = type || "read";
                    dataType = (this.options || defaultDataType)[type];
                    dataType = dataType ? dataType.dataType : "json";

                    if (type === "read") {
                        params = {
                            $inlinecount: "allpages"
                        };

                        if (dataType != "json") {
                            params.$format = "json";
                        }

                        for (option in options) {
                            if (mappers[option]) {
                                mappers[option](params, options[option]);
                            } else {
                                params[option] = options[option];
                            }
                        }
                    } else {
                        if (dataType !== "json") {
                            throw new Error("Only json dataType can be used for " + type + " operation.");
                        }

                        if (type !== "destroy") {
                            for (option in options) {
                                value = options[option];
                                if (typeof value === "number") {
                                    options[option] = value + "";
                                }
                            }

                            params = kendo.stringify(options);
                        }
                    }

                    return params;
                }
            }
        }
    });
})(jQuery);
(function($, undefined) {
    var kendo = window.kendo,
        isArray = $.isArray,
        isPlainObject = $.isPlainObject,
        map = $.map,
        each = $.each,
        extend = $.extend,
        getter = kendo.getter,
        Class = kendo.Class;

    var XmlDataReader = Class.extend({
        init: function(options) {
            var that = this,
                total = options.total,
                model = options.model,
                data = options.data;

            if (model) {
                if (isPlainObject(model)) {
                    if (model.fields) {
                        each(model.fields, function(field, value) {
                            if (isPlainObject(value) && value.field) {
                                value = extend(value, { field: that.getter(value.field) });
                            } else {
                                value = { field: that.getter(value) };
                            }
                            model.fields[field] = value;
                        });
                    }
                    var id = model.id;
                    if (id) {
                        var idField = {};

                        idField[that.xpathToMember(id, true)] = { field : that.getter(id) };
                        model.fields = extend(idField, model.fields);
                        model.id = that.xpathToMember(id);
                    }
                    model = kendo.data.Model.define(model);
                }

                that.model = model;
            }

            if (total) {
                total = that.getter(total);
                that.total = function(data) {
                    return parseInt(total(data), 10);
                };
            }

            if (data) {
                data = that.xpathToMember(data);
                that.data = function(value) {
                    var result = that.evaluate(value, data),
                        modelInstance;

                    result = isArray(result) ? result : [result];

                    if (that.model && model.fields) {
                        modelInstance = new that.model();

                        return map(result, function(value) {
                            if (value) {
                                var record = {}, field;

                                for (field in model.fields) {
                                    record[field] = modelInstance._parse(field, model.fields[field].field(value));
                                }

                                return record;
                            }
                        });
                    }

                    return result;
                };
            }
        },
        total: function(result) {
            return this.data(result).length;
        },
        errors: function(data) {
            return data ? data.errors : null;
        },
        parseDOM: function(element) {
            var result = {},
                parsedNode,
                node,
                nodeType,
                nodeName,
                member,
                attribute,
                attributes = element.attributes,
                attributeCount = attributes.length,
                idx;

            for (idx = 0; idx < attributeCount; idx++) {
                attribute = attributes[idx];
                result["@" + attribute.nodeName] = attribute.nodeValue;
            }

            for (node = element.firstChild; node; node = node.nextSibling) {
                nodeType = node.nodeType;

                if (nodeType === 3 || nodeType === 4) {
                    // text nodes or CDATA are stored as #text field
                    result["#text"] = node.nodeValue;
                } else if (nodeType === 1) {
                    // elements are stored as fields
                    parsedNode = this.parseDOM(node);

                    nodeName = node.nodeName;

                    member = result[nodeName];

                    if (isArray(member)) {
                        // elements of same nodeName are stored as array
                        member.push(parsedNode);
                    } else if (member !== undefined) {
                        member = [member, parsedNode];
                    } else {
                        member = parsedNode;
                    }

                    result[nodeName] = member;
                }
            }
            return result;
        },

        evaluate: function(value, expression) {
            var members = expression.split("."),
                member,
                result,
                length,
                intermediateResult,
                idx;

            while (member = members.shift()) {
                value = value[member];

                if (isArray(value)) {
                    result = [];
                    expression = members.join(".");

                    for (idx = 0, length = value.length; idx < length; idx++) {
                        intermediateResult = this.evaluate(value[idx], expression);

                        intermediateResult = isArray(intermediateResult) ? intermediateResult : [intermediateResult];

                        result.push.apply(result, intermediateResult);
                    }

                    return result;
                }
            }

            return value;
        },

        parse: function(xml) {
            var documentElement,
                tree,
                result = {};

            documentElement = xml.documentElement || $.parseXML(xml).documentElement;

            tree = this.parseDOM(documentElement);

            result[documentElement.nodeName] = tree;

            return result;
        },

        xpathToMember: function(member, raw) {
            if (!member) {
                return "";
            }

            member = member.replace(/^\//, "") // remove the first "/"
                           .replace(/\//g, "."); // replace all "/" with "."

            if (member.indexOf("@") >= 0) {
                // replace @attribute with '["@attribute"]'
                return member.replace(/\.?(@.*)/, raw? '$1':'["$1"]');
            }

            if (member.indexOf("text()") >= 0) {
                // replace ".text()" with '["#text"]'
                return member.replace(/(\.?text\(\))/, raw? '#text':'["#text"]');
            }

            return member;
        },
        getter: function(member) {
            return getter(this.xpathToMember(member), true);
        }
    });

    $.extend(true, kendo.data, {
        XmlDataReader: XmlDataReader,
        readers: {
            xml: XmlDataReader
        }
    });
})(jQuery);
(function($, undefined) {
    var extend = $.extend,
        proxy = $.proxy,
        isFunction = $.isFunction,
        isPlainObject = $.isPlainObject,
        isEmptyObject = $.isEmptyObject,
        isArray = $.isArray,
        grep = $.grep,
        ajax = $.ajax,
        map,
        each = $.each,
        noop = $.noop,
        kendo = window.kendo,
        Observable = kendo.Observable,
        Class = kendo.Class,
        STRING = "string",
        FUNCTION = "function",
        CREATE = "create",
        READ = "read",
        UPDATE = "update",
        DESTROY = "destroy",
        CHANGE = "change",
        GET = "get",
        ERROR = "error",
        REQUESTSTART = "requestStart",
        crud = [CREATE, READ, UPDATE, DESTROY],
        identity = function(o) { return o; },
        getter = kendo.getter,
        stringify = kendo.stringify,
        math = Math,
        push = [].push,
        join = [].join,
        pop = [].pop,
        splice = [].splice,
        shift = [].shift,
        slice = [].slice,
        unshift = [].unshift,
        toString = {}.toString,
        stableSort = kendo.support.stableSort,
        dateRegExp = /^\/Date\((.*?)\)\/$/,
        quoteRegExp = /(?=['\\])/g;

    var ObservableArray = Observable.extend({
        init: function(array, type) {
            var that = this;

            that.type = type || ObservableObject;

            Observable.fn.init.call(that);

            that.length = array.length;

            that.wrapAll(array, that);
        },

        toJSON: function() {
            var idx, length = this.length, value, json = new Array(length);

            for (idx = 0; idx < length; idx++){
                value = this[idx];

                if (value instanceof ObservableObject) {
                    value = value.toJSON();
                }

                json[idx] = value;
            }

            return json;
        },

        parent: noop,

        wrapAll: function(source, target) {
            var that = this,
                idx,
                length,
                parent = function() {
                    return that;
                };

            target = target || [];

            for (idx = 0, length = source.length; idx < length; idx++) {
                target[idx] = that.wrap(source[idx], parent);
            }

            return target;
        },

        wrap: function(object, parent) {
            var that = this,
                observable;

            if (object !== null && toString.call(object) === "[object Object]") {
                observable = object instanceof that.type || object instanceof Model;

                if (!observable) {
                    object = object instanceof ObservableObject ? object.toJSON() : object;
                    object = new that.type(object);
                }

                object.parent = parent;

                object.bind(CHANGE, function(e) {
                    that.trigger(CHANGE, {
                        field: e.field,
                        node: e.node,
                        index: e.index,
                        items: e.items || [this],
                        action: e.action || "itemchange"
                    });
                });
            }

            return object;
        },

        push: function() {
            var index = this.length,
                items = this.wrapAll(arguments),
                result;

            result = push.apply(this, items);

            this.trigger(CHANGE, {
                action: "add",
                index: index,
                items: items
            });

            return result;
        },

        slice: slice,

        join: join,

        pop: function() {
            var length = this.length, result = pop.apply(this);

            if (length) {
                this.trigger(CHANGE, {
                    action: "remove",
                    index: length - 1,
                    items:[result]
                });
            }

            return result;
        },

        splice: function(index, howMany, item) {
            var items = this.wrapAll(slice.call(arguments, 2)),
                result, i, len;

            result = splice.apply(this, [index, howMany].concat(items));

            if (result.length) {
                this.trigger(CHANGE, {
                    action: "remove",
                    index: index,
                    items: result
                });

                for (i = 0, len = result.length; i < len; i++) {
                    if (result[i].children) {
                        result[i].unbind(CHANGE);
                    }
                }
            }

            if (item) {
                this.trigger(CHANGE, {
                    action: "add",
                    index: index,
                    items: items
                });
            }
            return result;
        },

        shift: function() {
            var length = this.length, result = shift.apply(this);

            if (length) {
                this.trigger(CHANGE, {
                    action: "remove",
                    index: 0,
                    items:[result]
                });
            }

            return result;
        },

        unshift: function() {
            var items = this.wrapAll(arguments),
                result;

            result = unshift.apply(this, items);

            this.trigger(CHANGE, {
                action: "add",
                index: 0,
                items: items
            });

            return result;
        },

        indexOf: function(item) {
            var that = this,
                idx,
                length;

            for (idx = 0, length = that.length; idx < length; idx++) {
                if (that[idx] === item) {
                    return idx;
                }
            }
            return -1;
        }
    });

    var ObservableObject = Observable.extend({
        init: function(value) {
            var that = this,
                member,
                field,
                parent = function() {
                    return that;
                },
                type;

            Observable.fn.init.call(this);

            for (field in value) {
                member = value[field];
                if (field.charAt(0) != "_") {
                    type = toString.call(member);

                    member = that.wrap(member, field, parent);
                }
                that[field] = member;
            }

            that.uid = kendo.guid();
        },

        shouldSerialize: function(field) {
            return this.hasOwnProperty(field) && field !== "_events" && typeof this[field] !== FUNCTION && field !== "uid";
        },

        toJSON: function() {
            var result = {}, value, field;

            for (field in this) {
                if (this.shouldSerialize(field)) {
                    value = this[field];

                    if (value instanceof ObservableObject || value instanceof ObservableArray) {
                        value = value.toJSON();
                    }

                    result[field] = value;
                }
            }

            return result;
        },

        get: function(field) {
            var that = this, result;

            that.trigger(GET, { field: field });

            if (field === "this") {
                result = that;
            } else {
                result = kendo.getter(field, true)(that);
            }

            return result;
        },

        _set: function(field, value) {
            var that = this;
            if (field.indexOf(".")) {
                var paths = field.split("."),
                    path = "";

                while (paths.length > 1) {
                    path += paths.shift();
                    var obj = kendo.getter(path, true)(that);
                    if (obj instanceof ObservableObject) {
                        obj.set(paths.join("."), value);
                        return;
                    }
                    path += ".";
                }
            }

            kendo.setter(field)(that, value);
        },

        set: function(field, value) {
            var that = this,
                current = that[field],
                parent = function() { return that; };

            if (current !== value) {
                if (!that.trigger("set", { field: field, value: value })) {

                    that._set(field, that.wrap(value, field, parent));

                    that.trigger(CHANGE, { field: field });
                }
            }
        },

        parent: noop,

        wrap: function(object, field, parent) {
            var that = this,
                type = toString.call(object),
                isObservableArray = object instanceof ObservableArray;

            if (object !== null && type === "[object Object]" && !(object instanceof DataSource) && !isObservableArray) {
                if (!(object instanceof ObservableObject)) {
                    object = new ObservableObject(object);
                }

                object.parent = parent;

                (function(field) {
                    object.bind(GET, function(e) {
                        e.field = field + "." + e.field;
                        that.trigger(GET, e);
                    });

                    object.bind(CHANGE, function(e) {
                        e.field = field + "." + e.field;
                        that.trigger(CHANGE, e);
                    });
                })(field);
            } else if (object !== null && (type === "[object Array]" || isObservableArray)) {
                if (!isObservableArray) {
                    object = new ObservableArray(object);
                }
                object.parent = parent;

                (function(field) {
                    object.bind(CHANGE, function(e) {
                        that.trigger(CHANGE, { field: field, index: e.index, items: e.items, action: e.action});
                    });
                })(field);
            } else if (object !== null && object instanceof DataSource) {
                object._parent = parent; // assign parent to the DataSource if part of observable object
            }


            return object;
        }
    });

    function equal(x, y) {
        if (x === y) {
            return true;
        }

        var xtype = $.type(x), ytype = $.type(y), field;

        if (xtype !== ytype) {
            return false;
        }

        if (xtype === "date") {
            return x.getTime() === y.getTime();
        }

        if (xtype !== "object" && xtype !== "array") {
            return false;
        }

        for (field in x) {
            if (!equal(x[field], y[field])) {
                return false;
            }
        }

        return true;
    }

    var parsers = {
        "number": function(value) {
            return kendo.parseFloat(value);
        },

        "date": function(value) {
            if (typeof value === STRING) {
                var date = dateRegExp.exec(value);
                if (date) {
                    return new Date(parseInt(date[1], 10));
                }
            }
            return kendo.parseDate(value);
        },

        "boolean": function(value) {
            if (typeof value === STRING) {
                return value.toLowerCase() === "true";
            }
            return !!value;
        },

        "string": function(value) {
            return value + "";
        },

        "default": function(value) {
            return value;
        }
    };

    var defaultValues = {
        "string": "",
        "number": 0,
        "date": new Date(),
        "boolean": false,
        "default": ""
    };

    var Model = ObservableObject.extend({
        init: function(data) {
            var that = this;

            if (!data || $.isEmptyObject(data)) {
                data = $.extend({}, that.defaults, data);
            }

            ObservableObject.fn.init.call(that, data);

            that.dirty = false;

            if (that.idField) {
                that.id = that.get(that.idField);

                if (that.id === undefined) {
                    that.id = that._defaultId;
                }
            }
        },

        shouldSerialize: function(field) {
            return ObservableObject.fn.shouldSerialize.call(this, field) && field !== "uid" && !(this.idField !== "id" && field === "id") && field !== "dirty" && field !== "_accessors";
        },

        _parse: function(field, value) {
            var that = this,
            parse;

            field = (that.fields || {})[field];
            if (field) {
                parse = field.parse;
                if (!parse && field.type) {
                    parse = parsers[field.type.toLowerCase()];
                }
            }

            return parse ? parse(value) : value;
        },

        editable: function(field) {
            field = (this.fields || {})[field];
            return field ? field.editable !== false : true;
        },

        set: function(field, value, initiator) {
            var that = this;

            if (that.editable(field)) {
                value = that._parse(field, value);

                if (!equal(value, that.get(field))) {
                    that.dirty = true;
                    ObservableObject.fn.set.call(that, field, value, initiator);
                }
            }
        },

        accept: function(data) {
            var that = this;

            extend(that, data);

            if (that.idField) {
                that.id = that.get(that.idField);
            }
            that.dirty = false;
        },

        isNew: function() {
            return this.id === this._defaultId;
        }
    });

    Model.define = function(base, options) {
        if (options === undefined) {
            options = base;
            base = Model;
        }

        var model,
            proto = extend({}, { defaults: {} }, options),
            name,
            field,
            type,
            value,
            id = proto.id;

        if (id) {
            proto.idField = id;
        }

        if (proto.id) {
            delete proto.id;
        }

        if (id) {
            proto.defaults[id] = proto._defaultId = "";
        }

        for (name in proto.fields) {
            field = proto.fields[name];
            type = field.type || "default";
            value = null;

            name = typeof (field.field) === STRING ? field.field : name;

            if (!field.nullable) {
                value = proto.defaults[name] = field.defaultValue !== undefined ? field.defaultValue : defaultValues[type.toLowerCase()];
            }

            if (options.id === name) {
                proto._defaultId = value;
            }

            proto.defaults[name] = value;

            field.parse = field.parse || parsers[type];
        }

        model = base.extend(proto);
        model.define = function(options) {
            return Model.define(model, options);
        };

        if (proto.fields) {
            model.fields = proto.fields;
            model.idField = proto.idField;
        }

        return model;
    };

    var Comparer = {
        selector: function(field) {
            return isFunction(field) ? field : getter(field);
        },

        asc: function(field) {
            var selector = this.selector(field);
            return function (a, b) {
                a = selector(a);
                b = selector(b);

                return a > b ? 1 : (a < b ? -1 : 0);
            };
        },

        desc: function(field) {
            var selector = this.selector(field);
            return function (a, b) {
                a = selector(a);
                b = selector(b);

                return a < b ? 1 : (a > b ? -1 : 0);
            };
        },

        create: function(descriptor) {
            return this[descriptor.dir.toLowerCase()](descriptor.field);
        },

        combine: function(comparers) {
            return function(a, b) {
                var result = comparers[0](a, b),
                    idx,
                    length;

                for (idx = 1, length = comparers.length; idx < length; idx ++) {
                    result = result || comparers[idx](a, b);
                }

                return result;
            };
        }
    };

    var PositionComparer = extend({}, Comparer, {
        asc: function(field) {
            var selector = this.selector(field);
            return function (a, b) {
                var valueA = selector(a);
                var valueB = selector(b);

                if (valueA === valueB) {
                    return a.__position - b.__position;
                }
                return valueA > valueB ? 1 : (valueA < valueB ? -1 : 0);
            };
        },

        desc: function(field) {
            var selector = this.selector(field);
            return function (a, b) {
                var valueA = selector(a);
                var valueB = selector(b);

                if (valueA === valueB) {
                    return a.__position - b.__position;
                }

                return valueA < valueB ? 1 : (valueA > valueB ? -1 : 0);
            };
        }
    });

    map = function (array, callback) {
        var idx, length = array.length, result = new Array(length);

        for (idx = 0; idx < length; idx++) {
            result[idx] = callback(array[idx], idx, array);
        }

        return result;
    };

    var operators = (function(){

        function quote(value) {
            return value.replace(quoteRegExp, "\\");
        }

        function operator(op, a, b, ignore) {
            var date;

            if (b != null) {
                if (typeof b === STRING) {
                    b = quote(b);
                    date = dateRegExp.exec(b);
                    if (date) {
                        b = new Date(+date[1]);
                    } else if (ignore) {
                        b = "'" + b.toLowerCase() + "'";
                        a = "(" + a + " || '').toLowerCase()";
                    } else {
                        b = "'" + b + "'";
                    }
                }

                if (b.getTime) {
                    //b looks like a Date
                    a = "(" + a + "?" + a + ".getTime():" + a + ")";
                    b = b.getTime();
                }
            }

            return a + " " + op + " " + b;
        }

        return {
            eq: function(a, b, ignore) {
                return operator("==", a, b, ignore);
            },
            neq: function(a, b, ignore) {
                return operator("!=", a, b, ignore);
            },
            gt: function(a, b, ignore) {
                return operator(">", a, b, ignore);
            },
            gte: function(a, b, ignore) {
                return operator(">=", a, b, ignore);
            },
            lt: function(a, b, ignore) {
                return operator("<", a, b, ignore);
            },
            lte: function(a, b, ignore) {
                return operator("<=", a, b, ignore);
            },
            startswith: function(a, b, ignore) {
                if (ignore) {
                    a = a + ".toLowerCase()";
                    if (b) {
                        b = b.toLowerCase();
                    }
                }

                if (b) {
                    b = quote(b);
                }

                return a + ".lastIndexOf('" + b + "', 0) == 0";
            },
            endswith: function(a, b, ignore) {
                if (ignore) {
                    a = a + ".toLowerCase()";
                    if (b) {
                        b = b.toLowerCase();
                    }
                }

                if (b) {
                    b = quote(b);
                }

                return a + ".lastIndexOf('" + b + "') == " + a + ".length - " + (b || "").length;
            },
            contains: function(a, b, ignore) {
                if (ignore) {
                    a = "(" + a + " || '').toLowerCase()";
                    if (b) {
                        b = b.toLowerCase();
                    }
                }

                if (b) {
                    b = quote(b);
                }

                return a + ".indexOf('" + b + "') >= 0";
            },
            doesnotcontain: function(a, b, ignore) {
                if (ignore) {
                    a = "(" + a + " || '').toLowerCase()";
                    if (b) {
                        b = b.toLowerCase();
                    }
                }

                if (b) {
                    b = quote(b);
                }

                return a + ".indexOf('" + b + "') == -1";
            }
        };
    })();

    function Query(data) {
        this.data = data || [];
    }

    Query.filterExpr = function(expression) {
        var expressions = [],
            logic = { and: " && ", or: " || " },
            idx,
            length,
            filter,
            expr,
            fieldFunctions = [],
            operatorFunctions = [],
            field,
            operator,
            filters = expression.filters;

        for (idx = 0, length = filters.length; idx < length; idx++) {
            filter = filters[idx];
            field = filter.field;
            operator = filter.operator;

            if (filter.filters) {
                expr = Query.filterExpr(filter);
                //Nested function fields or operators - update their index e.g. __o[0] -> __o[1]
                filter = expr.expression
                .replace(/__o\[(\d+)\]/g, function(match, index) {
                    index = +index;
                    return "__o[" + (operatorFunctions.length + index) + "]";
                })
                .replace(/__f\[(\d+)\]/g, function(match, index) {
                    index = +index;
                    return "__f[" + (fieldFunctions.length + index) + "]";
                });

                operatorFunctions.push.apply(operatorFunctions, expr.operators);
                fieldFunctions.push.apply(fieldFunctions, expr.fields);
            } else {
                if (typeof field === FUNCTION) {
                    expr = "__f[" + fieldFunctions.length +"](d)";
                    fieldFunctions.push(field);
                } else {
                    expr = kendo.expr(field);
                }

                if (typeof operator === FUNCTION) {
                    filter = "__o[" + operatorFunctions.length + "](" + expr + ", " + filter.value + ")";
                    operatorFunctions.push(operator);
                } else {
                    filter = operators[(operator || "eq").toLowerCase()](expr, filter.value, filter.ignoreCase !== undefined? filter.ignoreCase : true);
                }
            }

            expressions.push(filter);
        }

        return  { expression: "(" + expressions.join(logic[expression.logic]) + ")", fields: fieldFunctions, operators: operatorFunctions };
    };

    function normalizeSort(field, dir) {
        if (field) {
            var descriptor = typeof field === STRING ? { field: field, dir: dir } : field,
            descriptors = isArray(descriptor) ? descriptor : (descriptor !== undefined ? [descriptor] : []);

            return grep(descriptors, function(d) { return !!d.dir; });
        }
    }

    var operatorMap = {
        "==": "eq",
        equals: "eq",
        isequalto: "eq",
        equalto: "eq",
        equal: "eq",
        "!=": "neq",
        ne: "neq",
        notequals: "neq",
        isnotequalto: "neq",
        notequalto: "neq",
        notequal: "neq",
        "<": "lt",
        islessthan: "lt",
        lessthan: "lt",
        less: "lt",
        "<=": "lte",
        le: "lte",
        islessthanorequalto: "lte",
        lessthanequal: "lte",
        ">": "gt",
        isgreaterthan: "gt",
        greaterthan: "gt",
        greater: "gt",
        ">=": "gte",
        isgreaterthanorequalto: "gte",
        greaterthanequal: "gte",
        ge: "gte",
        notsubstringof: "doesnotcontain"
    };

    function normalizeOperator(expression) {
        var idx,
        length,
        filter,
        operator,
        filters = expression.filters;

        if (filters) {
            for (idx = 0, length = filters.length; idx < length; idx++) {
                filter = filters[idx];
                operator = filter.operator;

                if (operator && typeof operator === STRING) {
                    filter.operator = operatorMap[operator.toLowerCase()] || operator;
                }

                normalizeOperator(filter);
            }
        }
    }

    function normalizeFilter(expression) {
        if (expression && !isEmptyObject(expression)) {
            if (isArray(expression) || !expression.filters) {
                expression = {
                    logic: "and",
                    filters: isArray(expression) ? expression : [expression]
                };
            }

            normalizeOperator(expression);

            return expression;
        }
    }

    Query.normalizeFilter = normalizeFilter;

    function normalizeAggregate(expressions) {
        return isArray(expressions) ? expressions : [expressions];
    }

    function normalizeGroup(field, dir) {
        var descriptor = typeof field === STRING ? { field: field, dir: dir } : field,
        descriptors = isArray(descriptor) ? descriptor : (descriptor !== undefined ? [descriptor] : []);

        return map(descriptors, function(d) { return { field: d.field, dir: d.dir || "asc", aggregates: d.aggregates }; });
    }

    Query.prototype = {
        toArray: function () {
            return this.data;
        },
        range: function(index, count) {
            return new Query(this.data.slice(index, index + count));
        },
        skip: function (count) {
            return new Query(this.data.slice(count));
        },
        take: function (count) {
            return new Query(this.data.slice(0, count));
        },
        select: function (selector) {
            return new Query(map(this.data, selector));
        },
        orderBy: function (selector) {
            var result = this.data.slice(0),
            comparer = isFunction(selector) || !selector ? Comparer.asc(selector) : selector.compare;

            return new Query(result.sort(comparer));
        },
        orderByDescending: function (selector) {
            return new Query(this.data.slice(0).sort(Comparer.desc(selector)));
        },
        sort: function(field, dir, comparer) {
            var idx,
            length,
            descriptors = normalizeSort(field, dir),
            comparers = [];

            comparer = comparer || Comparer;

            if (descriptors.length) {
                for (idx = 0, length = descriptors.length; idx < length; idx++) {
                    comparers.push(comparer.create(descriptors[idx]));
                }

                return this.orderBy({ compare: comparer.combine(comparers) });
            }

            return this;
        },

        filter: function(expressions) {
            var idx,
            current,
            length,
            compiled,
            predicate,
            data = this.data,
            fields,
            operators,
            result = [],
            filter;

            expressions = normalizeFilter(expressions);

            if (!expressions || expressions.filters.length === 0) {
                return this;
            }

            compiled = Query.filterExpr(expressions);
            fields = compiled.fields;
            operators = compiled.operators;

            predicate = filter = new Function("d, __f, __o", "return " + compiled.expression);

            if (fields.length || operators.length) {
                filter = function(d) {
                    return predicate(d, fields, operators);
                };
            }

            for (idx = 0, length = data.length; idx < length; idx++) {
                current = data[idx];

                if (filter(current)) {
                    result.push(current);
                }
            }
            return new Query(result);
        },

        group: function(descriptors, allData) {
            descriptors =  normalizeGroup(descriptors || []);
            allData = allData || this.data;

            var that = this,
            result = new Query(that.data),
            descriptor;

            if (descriptors.length > 0) {
                descriptor = descriptors[0];
                result = result.groupBy(descriptor).select(function(group) {
                    var data = new Query(allData).filter([ { field: group.field, operator: "eq", value: group.value } ]);
                    return {
                        field: group.field,
                        value: group.value,
                        items: descriptors.length > 1 ? new Query(group.items).group(descriptors.slice(1), data.toArray()).toArray() : group.items,
                        hasSubgroups: descriptors.length > 1,
                        aggregates: data.aggregate(descriptor.aggregates)
                    };
                });
            }
            return result;
        },

        groupBy: function(descriptor) {
            if (isEmptyObject(descriptor) || !this.data.length) {
                return new Query([]);
            }

            var field = descriptor.field,
                sorted = this._sortForGrouping(field, descriptor.dir || "asc"),
                accessor = kendo.accessor(field),
                item,
                groupValue = accessor.get(sorted[0], field),
                group = {
                    field: field,
                    value: groupValue,
                    items: []
                },
                currentValue,
                idx,
                len,
                result = [group];

            for(idx = 0, len = sorted.length; idx < len; idx++) {
                item = sorted[idx];
                currentValue = accessor.get(item, field);
                if(!groupValueComparer(groupValue, currentValue)) {
                    groupValue = currentValue;
                    group = {
                        field: field,
                        value: groupValue,
                        items: []
                    };
                    result.push(group);
                }
                group.items.push(item);
            }
            return new Query(result);
        },

        _sortForGrouping: function(field, dir) {
            var idx, length,
                data = this.data;

            if (!stableSort) {
                for (idx = 0, length = data.length; idx < length; idx++) {
                    data[idx].__position = idx;
                }

                data = new Query(data).sort(field, dir, PositionComparer).toArray();

                for (idx = 0, length = data.length; idx < length; idx++) {
                    delete data[idx].__position;
                }
                return data;
            }
            return this.sort(field, dir).toArray();
        },

        aggregate: function (aggregates) {
            var idx,
            len,
            result = {};

            if (aggregates && aggregates.length) {
                for(idx = 0, len = this.data.length; idx < len; idx++) {
                    calculateAggregate(result, aggregates, this.data[idx], idx, len);
                }
            }
            return result;
        }
    };

    function groupValueComparer(a, b) {
        if (a && a.getTime && b && b.getTime) {
            return a.getTime() === b.getTime();
        }
        return a === b;
    }

    function calculateAggregate(accumulator, aggregates, item, index, length) {
        aggregates = aggregates || [];
        var idx,
        aggr,
        functionName,
        len = aggregates.length;

        for (idx = 0; idx < len; idx++) {
            aggr = aggregates[idx];
            functionName = aggr.aggregate;
            var field = aggr.field;
            accumulator[field] = accumulator[field] || {};
            accumulator[field][functionName] = functions[functionName.toLowerCase()](accumulator[field][functionName], item, kendo.accessor(field), index, length);
        }
    }

    var functions = {
        sum: function(accumulator, item, accessor) {
            return (accumulator || 0) + accessor.get(item);
        },
        count: function(accumulator, item, accessor) {
            return (accumulator || 0) + 1;
        },
        average: function(accumulator, item, accessor, index, length) {
            accumulator = (accumulator || 0) + accessor.get(item);
            if(index == length - 1) {
                accumulator = accumulator / length;
            }
            return accumulator;
        },
        max: function(accumulator, item, accessor) {
            var value = accessor.get(item);

            accumulator = accumulator || 0;

            if(accumulator < value) {
                accumulator = value;
            }
            return accumulator;
        },
        min: function(accumulator, item, accessor) {
            var value = accessor.get(item);

            accumulator = (accumulator || value);

            if(accumulator > value) {
                accumulator = value;
            }
            return accumulator;
        }
    };

    function toJSON(array) {
        var idx, length = array.length, result = new Array(length);

        for (idx = 0; idx < length; idx++) {
            result[idx] = array[idx].toJSON();
        }

        return result;
    }

    function process(data, options) {
        options = options || {};

        var query = new Query(data),
            group = options.group,
            sort = normalizeGroup(group || []).concat(normalizeSort(options.sort || [])),
            total,
            filter = options.filter,
            skip = options.skip,
            take = options.take;

        if (filter) {
            query = query.filter(filter);
            total = query.toArray().length;
        }

        if (sort) {
            query = query.sort(sort);

            if (group) {
                data = query.toArray();
            }
        }

        if (skip !== undefined && take !== undefined) {
            query = query.range(skip, take);
        }

        if (group) {
            query = query.group(group, data);
        }

        return {
            total: total,
            data: query.toArray()
        };
    }

    function calculateAggregates(data, options) {
        options = options || {};

        var query = new Query(data),
            aggregates = options.aggregate,
            filter = options.filter;

        if(filter) {
            query = query.filter(filter);
        }

        return query.aggregate(aggregates);
    }

    var LocalTransport = Class.extend({
        init: function(options) {
            this.data = options.data;
        },

        read: function(options) {
            options.success(this.data);
        },
        update: function(options) {
            options.success(options.data);
        },
        create: function(options) {
            options.success(options.data);
        },
        destroy: noop
    });

    var RemoteTransport = Class.extend( {
        init: function(options) {
            var that = this, parameterMap;

            options = that.options = extend({}, that.options, options);

            each(crud, function(index, type) {
                if (typeof options[type] === STRING) {
                    options[type] = {
                        url: options[type]
                    };
                }
            });

            that.cache = options.cache? Cache.create(options.cache) : {
                find: noop,
                add: noop
            };

            parameterMap = options.parameterMap;

            that.parameterMap = isFunction(parameterMap) ? parameterMap : function(options) {
                var result = {};

                each(options, function(option, value) {
                    if (option in parameterMap) {
                        option = parameterMap[option];
                        if (isPlainObject(option)) {
                            value = option.value(value);
                            option = option.key;
                        }
                    }

                    result[option] = value;
                });

                return result;
            };
        },

        options: {
            parameterMap: identity
        },

        create: function(options) {
            return ajax(this.setup(options, CREATE));
        },

        read: function(options) {
            var that = this,
                success,
                error,
                result,
                cache = that.cache;

            options = that.setup(options, READ);

            success = options.success || noop;
            error = options.error || noop;

            result = cache.find(options.data);

            if(result !== undefined) {
                success(result);
            } else {
                options.success = function(result) {
                    cache.add(options.data, result);

                    success(result);
                };

                $.ajax(options);
            }
        },

        update: function(options) {
            return ajax(this.setup(options, UPDATE));
        },

        destroy: function(options) {
            return ajax(this.setup(options, DESTROY));
        },

        setup: function(options, type) {
            options = options || {};

            var that = this,
                parameters,
                operation = that.options[type],
                data = isFunction(operation.data) ? operation.data(options.data) : operation.data;

            options = extend(true, {}, operation, options);
            parameters = extend(true, {}, data, options.data);

            options.data = that.parameterMap(parameters, type);

            if (isFunction(options.url)) {
                options.url = options.url(parameters);
            }

            return options;
        }
    });

    var Cache = Class.extend({
        init: function() {
            this._store = {};
        },
        add: function(key, data) {
            if(key !== undefined) {
                this._store[stringify(key)] = data;
            }
        },
        find: function(key) {
            return this._store[stringify(key)];
        },
        clear: function() {
            this._store = {};
        },
        remove: function(key) {
            delete this._store[stringify(key)];
        }
    });

    Cache.create = function(options) {
        var store = {
            "inmemory": function() { return new Cache(); }
        };

        if (isPlainObject(options) && isFunction(options.find)) {
            return options;
        }

        if (options === true) {
            return new Cache();
        }

        return store[options]();
    };

    function convertRecords(data, getters, modelInstance) {
        var record,
            getter,
            idx,
            length;

        for (idx = 0, length = data.length; idx < length; idx++) {
            record = data[idx];
            for (getter in getters) {
                record[getter] = modelInstance._parse(getter, getters[getter](record));
            }
        }
    }

    function convertGroup(data, getters, modelInstance) {
        var record,
            idx,
            length;

        for (idx = 0, length = data.length; idx < length; idx++) {
            record = data[idx];
            record.value = modelInstance._parse(record.field, record.value);

            if (record.hasSubgroups) {
                convertGroup(record.items, getters, modelInstance);
            } else {
                convertRecords(record.items, getters, modelInstance);
            }
        }
    }

    function wrapDataAccess(originalFunction, model, converter, getters) {
        return function(data) {
            data = originalFunction(data);

            if (data && !isEmptyObject(getters)) {
                if (toString.call(data) !== "[object Array]" && !(data instanceof ObservableArray)) {
                    data = [data];
                }

                converter(data, getters, new model());
            }

            return data || [];
        };
    }

    var DataReader = Class.extend({
        init: function(schema) {
            var that = this, member, get, model, base;

            schema = schema || {};

            for (member in schema) {
                get = schema[member];

                that[member] = typeof get === STRING ? getter(get) : get;
            }

            base = schema.modelBase || Model;

            if (isPlainObject(that.model)) {
                that.model = model = base.define(that.model);

                var dataFunction = proxy(that.data, that),
                    groupsFunction = proxy(that.groups, that),
                    getters = {};

                if (model.fields) {
                    each(model.fields, function(field, value) {
                        if (isPlainObject(value) && value.field) {
                            getters[value.field] = getter(value.field);
                        } else {
                            getters[field] = getter(field);
                        }
                    });
                }

                that.data = wrapDataAccess(dataFunction, model, convertRecords, getters);
                that.groups = wrapDataAccess(groupsFunction, model, convertGroup, getters);
            }
        },
        errors: function(data) {
            return data ? data.errors : null;
        },
        parse: identity,
        data: identity,
        total: function(data) {
            return data.length;
        },
        groups: identity,
        status: function(data) {
            return data.status;
        },
        aggregates: function() {
            return {};
        }
    });

    function flattenGroups(data) {
        var idx, length, result = [];

        for (idx = 0, length = data.length; idx < length; idx++) {
            if (data[idx].hasSubgroups) {
                result = result.concat(flattenGroups(data[idx].items));
            } else {
                result = result.concat(data[idx].items.slice());
            }
        }
        return result;
    }
    function wrapGroupItems(data, model) {
        var idx, length, group, items;
        if (model) {
            for (idx = 0, length = data.length; idx < length; idx++) {
                group = data[idx];
                items = group.items;

                if (group.hasSubgroups) {
                    wrapGroupItems(items, model);
                } else if (items.length && !(items[0] instanceof model)) {
                    items.type = model;
                    items.wrapAll(items, items);
                }
            }
        }
    }

    function eachGroupItems(data, func) {
        var idx, length;

        for (idx = 0, length = data.length; idx < length; idx++) {
            if (data[idx].hasSubgroups) {
                if (eachGroupItems(data[idx].items, func)) {
                    return true;
                }
            } else {
                if (func(data[idx].items, data[idx])) {
                    return true;
                }
            }
        }
    }

    function removeModel(data, model) {
        var idx, length;

        for (idx = 0, length = data.length; idx < length; idx++) {
            if (data[idx].uid == model.uid) {
                model = data[idx];
                data.splice(idx, 1);
                return model;
            }
        }
    }

    function wrapInEmptyGroup(groups, model) {
        var parent,
            group,
            idx,
            length;

        for (idx = groups.length-1, length = 0; idx >= length; idx--) {
            group = groups[idx];
            parent = {
                value: model.get(group.field),
                field: group.field,
                items: parent ? [parent] : [model],
                hasSubgroups: !!parent,
                aggregates: {}
            };
        }

        return parent;
    }

    function indexOfPristineModel(data, model) {
        if (model) {
            return indexOf(data, function(item) {
                return item[model.idField] === model.id;
            });
        }
        return -1;
    }

    function indexOfModel(data, model) {
        if (model) {
            return indexOf(data, function(item) {
                return item.uid == model.uid;
            });
        }
        return -1;
    }

    function indexOf(data, comparer) {
        var idx, length;

        for (idx = 0, length = data.length; idx < length; idx++) {
            if (comparer(data[idx])) {
                return idx;
            }
        }

        return -1;
    }

    var DataSource = Observable.extend({
        init: function(options) {
            var that = this, model, transport, data;

            if (options) {
                data = options.data;
            }

            options = that.options = extend({}, that.options, options);

            extend(that, {
                _map: {},
                _prefetch: {},
                _data: [],
                _ranges: [],
                _view: [],
                _pristine: [],
                _destroyed: [],
                _pageSize: options.pageSize,
                _page: options.page  || (options.pageSize ? 1 : undefined),
                _sort: normalizeSort(options.sort),
                _filter: normalizeFilter(options.filter),
                _group: normalizeGroup(options.group),
                _aggregate: options.aggregate,
                _total: options.total
            });

            Observable.fn.init.call(that);

            transport = options.transport;

            if (transport) {
                transport.read = typeof transport.read === STRING ? { url: transport.read } : transport.read;

                if (options.type) {
                    if (kendo.data.transports[options.type] && !isPlainObject(kendo.data.transports[options.type])) {
                       that.transport = new kendo.data.transports[options.type](extend(transport, { data: data }));
                    } else {
                        transport = extend(true, {}, kendo.data.transports[options.type], transport);
                    }

                    options.schema = extend(true, {}, kendo.data.schemas[options.type], options.schema);
                }

                if (!that.transport) {
                    that.transport = isFunction(transport.read) ? transport: new RemoteTransport(transport);
                }
            } else {
                that.transport = new LocalTransport({ data: options.data });
            }

            that.reader = new kendo.data.readers[options.schema.type || "json" ](options.schema);

            model = that.reader.model || {};

            that._data = that._observe(that._data);

            that.bind([ERROR, CHANGE, REQUESTSTART], options);
        },

        options: {
            data: [],
            schema: {
               modelBase: Model
            },
            serverSorting: false,
            serverPaging: false,
            serverFiltering: false,
            serverGrouping: false,
            serverAggregates: false,
            sendAllFields: true,
            batch: false
        },

        _flatData: function(data) {
            if (this.options.serverGrouping && this.group().length) {
                return flattenGroups(data);
            }
            return data;
        },

        get: function(id) {
            var idx, length, data = this._flatData(this._data);

            for (idx = 0, length = data.length; idx < length; idx++) {
                if (data[idx].id == id) {
                    return data[idx];
                }
            }
        },

        getByUid: function(id) {
            var idx, length, data = this._flatData(this._data);

            for (idx = 0, length = data.length; idx < length; idx++) {
                if (data[idx].uid == id) {
                    return data[idx];
                }
            }
        },

        sync: function() {
            var that = this,
                idx,
                length,
                created = [],
                updated = [],
                destroyed = that._destroyed,
                data = that._flatData(that._data);

            if (!that.reader.model) {
                return;
            }

            for (idx = 0, length = data.length; idx < length; idx++) {
                if (data[idx].isNew()) {
                    created.push(data[idx]);
                } else if (data[idx].dirty) {
                    updated.push(data[idx]);
                }
            }

            var promises = that._send("create", created);

            promises.push.apply(promises ,that._send("update", updated));
            promises.push.apply(promises ,that._send("destroy", destroyed));

            $.when.apply(null, promises)
                .then(function() {
                    var idx,
                    length;

                    for (idx = 0, length = arguments.length; idx < length; idx++){
                        that._accept(arguments[idx]);
                    }

                    that._change();
                });
        },

        _accept: function(result) {
            var that = this,
                models = result.models,
                response = result.response,
                idx = 0,
                serverGroup = that.options.serverGrouping && that.group() && that.group().length,
                pristine = that.reader.data(that._pristine),
                type = result.type,
                length;

            if (response) {
                response = that.reader.parse(response);

                if (that._handleCustomErrors(response)) {
                    return;
                }

                response = that.reader.data(response);

                if (!$.isArray(response)) {
                    response = [response];
                }
            } else {
                response = $.map(models, function(model) { return model.toJSON(); } );
            }

            if (type === "destroy") {
                that._destroyed = [];
            }

            for (idx = 0, length = models.length; idx < length; idx++) {
                if (type !== "destroy") {
                    models[idx].accept(response[idx]);

                    if (type === "create") {
                        pristine.push(serverGroup ? wrapInEmptyGroup(that.group(), models[idx]) : models[idx]);
                    } else if (type === "update") {
                        if (serverGroup) {
                            that._updatePristineGroupModel(models[idx], response[idx]);
                        } else {
                            extend(pristine[that._pristineIndex(models[idx])], response[idx]);
                        }
                    }
                } else {
                    if (serverGroup) {
                        that._removePristineGroupModel(models[idx]);
                    } else {
                        pristine.splice(that._pristineIndex(models[idx]), 1);
                    }
                }
            }
        },

        _pristineIndex: function(model) {
            var that = this,
                idx,
                length,
                pristine = that.reader.data(that._pristine);

            for (idx = 0, length = pristine.length; idx < length; idx++) {
                if (pristine[idx][model.idField] === model.id) {
                    return idx;
                }
            }
            return -1;
        },

        _updatePristineGroupModel: function(model, values) {
            var pristineData = this.reader.groups(this._pristine),
                index;

            eachGroupItems(pristineData,
                function(items, group) {
                    index = indexOfPristineModel(items, model);
                    if (index > -1) {
                        extend(true, items[index], values);
                        return true;
                    }
                });
        },

        _removePristineGroupModel: function(model) {
            var pristineData = this.reader.groups(this._pristine),
                index;

            eachGroupItems(pristineData,
                function(items, group) {
                    index = indexOfPristineModel(items, model);
                    if (index > -1) {
                        items.splice(index, 1);
                        return true;
                    }
                });
        },
        _promise: function(data, models, type) {
            var that = this,
            transport = that.transport;

            return $.Deferred(function(deferred) {
                transport[type].call(transport, extend({
                    success: function(response) {
                        deferred.resolve({
                            response: response,
                            models: models,
                            type: type
                        });
                    },
                    error: function(response) {
                        deferred.reject(response);
                        that.trigger(ERROR, response);
                    }
                }, data)
                );
            }).promise();
        },

        _send: function(method, data) {
            var that = this,
                idx,
                length,
                promises = [];

            if (that.options.batch) {
                if (data.length) {
                    promises.push(that._promise( { data: { models: toJSON(data) } }, data , method));
                }
            } else {
                for (idx = 0, length = data.length; idx < length; idx++) {
                    promises.push(that._promise( { data: data[idx].toJSON() }, [ data[idx] ], method));
                }
            }

            return promises;
        },

        add: function(model) {
            return this.insert(this._data.length, model);
        },

        insert: function(index, model) {
            if (!model) {
                model = index;
                index = 0;
            }

            if (!(model instanceof Model)) {
                if (this.reader.model) {
                    model = new this.reader.model(model);
                } else {
                    model = new ObservableObject(model);
                }
            }

            if (this.options.serverGrouping && this.group() && this.group().length) {
                this._data.splice(index, 0, wrapInEmptyGroup(this.group(), model));
            } else {
                this._data.splice(index, 0, model);
            }

            return model;
        },

        cancelChanges: function(model) {
            var that = this,
                pristineIndex,
                serverGroup = that.options.serverGrouping && that.group() && that.group().length,
                read = !serverGroup ? that.reader.data : that.reader.groups,
                pristine = read(that._pristine),
                index;

            if (model instanceof kendo.data.Model) {
                if (serverGroup) {
                    that._cancelGroupModel(model);
                } else {
                    index = that.indexOf(model);
                    pristineIndex = that._pristineIndex(model);
                    if (index != -1) {
                        if (pristineIndex != -1 && !model.isNew()) {
                            extend(true, that._data[index], pristine[pristineIndex]);
                        } else {
                            that._data.splice(index, 1);
                        }
                    }
                }
            } else {
                that._destroyed = [];
                that._data = that._observe(pristine);
                that._change();
            }
        },

        read: function(data) {
            var that = this, params = that._params(data);

            that._queueRequest(params, function() {
                that.trigger(REQUESTSTART);
                that._ranges = [];
                that.transport.read({
                    data: params,
                    success: proxy(that.success, that),
                    error: proxy(that.error, that)
                });
            });
        },

        _cancelGroupModel: function(model) {
            var pristineData = this.reader.groups(this._pristine),
                pristine,
                idx;

            eachGroupItems(pristineData,
                function(items, group) {
                    idx = indexOfPristineModel(items, model);
                    if (idx > -1) {
                        pristine = items[idx];
                        return true;
                    }
                });

            if (idx > -1) {
                eachGroupItems(this._data, function(items, group) {
                    idx = indexOfModel(items, model);
                    if (idx > -1) {
                        if (!model.isNew()) {
                            extend(true, items[idx], pristine);
                        } else {
                            items.splice(idx, 1);
                        }
                    }
                });
            }
        },

        indexOf: function(model) {
            return indexOfModel(this._data, model);
        },

        _params: function(data) {
            var that = this,
            options =  extend({
                take: that.take(),
                skip: that.skip(),
                page: that.page(),
                pageSize: that.pageSize(),
                sort: that._sort,
                filter: that._filter,
                group: that._group,
                aggregate: that._aggregate
            }, data);

            if (!that.options.serverPaging) {
                delete options.take;
                delete options.skip;
                delete options.page;
                delete options.pageSize;
            }
            return options;
        },

        _queueRequest: function(options, callback) {
            var that = this;
            if (!that._requestInProgress) {
                that._requestInProgress = true;
                that._pending = undefined;
                callback();
            } else {
                that._pending = { callback: proxy(callback, that), options: options };
            }
        },

        _dequeueRequest: function() {
            var that = this;
            that._requestInProgress = false;
            if (that._pending) {
                that._queueRequest(that._pending.options, that._pending.callback);
            }
        },

        remove: function(model) {
            var data = this._data;

            if (this.options.serverGrouping && this.group() && this.group().length) {
                return this._removeGroupItem(data, model);
            }
            return removeModel(data, model);
        },

        _removeGroupItem: function(data, model) {
            var result;

            eachGroupItems(data, function(items, group) {
                result = removeModel(items, model);
                if (result) {
                    return true;
                }
            });
            return model;
        },

        error: function(xhr, status, errorThrown) {
            this._dequeueRequest();
            this.trigger(ERROR, { xhr: xhr, status: status, errorThrown: errorThrown });
        },

        _handleCustomErrors: function(response) {
            if (this.reader.errors) {
                var errors = this.reader.errors(response);
                if (errors) {
                    this.trigger(ERROR, { xhr: null, status: "customerror", errorThrown: "custom error", errors: errors });
                    return true;
                }
            }
            return false;
        },

        _parent: noop,

        success: function(data) {
            var that = this,
                options = that.options,
                hasGroups = options.serverGrouping === true && that._group && that._group.length > 0;

            data = that.reader.parse(data);

            if (that._handleCustomErrors(data)) {
                return;
            }

            that._pristine = isPlainObject(data) ? $.extend(true, {}, data) : data.slice(0);

            that._total = that.reader.total(data);

            if (that._aggregate && options.serverAggregates) {
                that._aggregateResult = that.reader.aggregates(data);
            }

            if (hasGroups) {
                data = that.reader.groups(data);
            } else {
                data = that.reader.data(data);
            }

            that._data = that._observe(data);

            var start = that._skip || 0,
            end = start + that._data.length;

            that._ranges.push({ start: start, end: end, data: that._data });
            that._ranges.sort( function(x, y) { return x.start - y.start; } );

            that._dequeueRequest();
            that._process(that._data);
        },

        _observe: function(data) {
            var that = this,
                model = that.reader.model,
                wrap = false;

            if (model && data.length) {
                wrap = !(data[0] instanceof model);
            }

            if (data instanceof ObservableArray) {
                if (wrap) {
                    data.type = that.reader.model;
                    data.wrapAll(data, data);
                }
            } else {
                data = new ObservableArray(data, that.reader.model);
                data.parent = function() { return that._parent(); };
            }

            if (that.group() && that.group().length && that.options.serverGrouping) {
                wrapGroupItems(data, model);
            }

            return data.bind(CHANGE, proxy(that._change, that));
        },

        _change: function(e) {
            var that = this, idx, length, action = e ? e.action : "";

            if (action === "remove") {
                for (idx = 0, length = e.items.length; idx < length; idx++) {
                    if (!e.items[idx].isNew || !e.items[idx].isNew()) {
                        that._destroyed.push(e.items[idx]);
                    }
                }
            }

            if (that.options.autoSync && (action === "add" || action === "remove" || action === "itemchange")) {
                that.sync();
            } else {
                var total = that._total || that.reader.total(that._pristine);
                if (action === "add") {
                    total++;
                } else if (action === "remove") {
                    total--;
                } else if (action !== "itemchange" && !that.options.serverPaging) {
                    total = that.reader.total(that._pristine);
                }

                that._total = total;

                that._process(that._data, e);
            }
        },

        _process: function (data, e) {
            var that = this,
                options = {},
                result;

            if (that.options.serverPaging !== true) {
                options.skip = that._skip;
                options.take = that._take || that._pageSize;

                if(options.skip === undefined && that._page !== undefined && that._pageSize !== undefined) {
                    options.skip = (that._page - 1) * that._pageSize;
                }
            }

            if (that.options.serverSorting !== true) {
                options.sort = that._sort;
            }

            if (that.options.serverFiltering !== true) {
                options.filter = that._filter;
            }

            if (that.options.serverGrouping !== true) {
                options.group = that._group;
            }

            if (that.options.serverAggregates !== true) {
                options.aggregate = that._aggregate;
                that._aggregateResult = calculateAggregates(data, options);
            }

            result = process(data, options);

            that._view = result.data;

            if (result.total !== undefined && !that.options.serverFiltering) {
                that._total = result.total;
            }

            e = e || {};

            e.items = e.items || that._view;

            that.trigger(CHANGE, e);
        },

        at: function(index) {
            return this._data[index];
        },

        data: function(value) {
            var that = this;
            if (value !== undefined) {
                that._data = this._observe(value);

                that._total = that._data.length;

                that._process(that._data);
            } else {
                return that._data;
            }
        },

        view: function() {
            return this._view;
        },

        query: function(options) {
            var that = this,
            result,
            remote = that.options.serverSorting || that.options.serverPaging || that.options.serverFiltering || that.options.serverGrouping || that.options.serverAggregates;

            if (options !== undefined) {
                that._pageSize = options.pageSize;
                that._page = options.page;
                that._sort = options.sort;
                that._filter = options.filter;
                that._group = options.group;
                that._aggregate = options.aggregate;
                that._skip = options.skip;
                that._take = options.take;

                if(that._skip === undefined) {
                    that._skip = that.skip();
                    options.skip = that.skip();
                }

                if(that._take === undefined && that._pageSize !== undefined) {
                    that._take = that._pageSize;
                    options.take = that._take;
                }

                if (options.sort) {
                    that._sort = options.sort = normalizeSort(options.sort);
                }

                if (options.filter) {
                    that._filter = options.filter = normalizeFilter(options.filter);
                }

                if (options.group) {
                    that._group = options.group = normalizeGroup(options.group);
                }
                if (options.aggregate) {
                    that._aggregate = options.aggregate = normalizeAggregate(options.aggregate);
                }
            }

            if (remote || (that._data === undefined || that._data.length === 0)) {
                that.read(options);
            } else {
                that.trigger(REQUESTSTART);
                result = process(that._data, options);

                if (!that.options.serverFiltering) {
                    if (result.total !== undefined) {
                        that._total = result.total;
                    } else {
                        that._total = that._data.length;
                    }
                }

                that._view = result.data;
                that._aggregateResult = calculateAggregates(that._data, options);
                that.trigger(CHANGE, { items: result.data });
            }
        },

        fetch: function(callback) {
            var that = this;

            if (callback && isFunction(callback)) {
                that.one(CHANGE, callback);
            }

            that._query();
        },

        _query: function(options) {
            var that = this;

            that.query(extend({}, {
                page: that.page(),
                pageSize: that.pageSize(),
                sort: that.sort(),
                filter: that.filter(),
                group: that.group(),
                aggregate: that.aggregate()
            }, options));
        },

        next: function() {
            var that = this,
                page = that.page(),
                total = that.total();

            if (!page) {
                return;
            }

            if (total) {
                that.page(page + 1);
            } else {
                that._skip = page * that.take();
                that._query({ page: page + 1 });
            }
        },

        prev: function() {
            var that = this,
                page = that.page(),
                total = that.total();

            if (!page || page === 1) {
                return;
            }

            if (total) {
                that.page(page - 1);
            } else {
                that._skip = that._skip - that.take();
                that._query({ page: page - 1});
            }
        },

        page: function(val) {
            var that = this,
            skip;

            if(val !== undefined) {
                val = math.max(math.min(math.max(val, 1), that.totalPages()), 1);
                that._query({ page: val });
                return;
            }
            skip = that.skip();

            return skip !== undefined ? math.round((skip || 0) / (that.take() || 1)) + 1 : undefined;
        },

        pageSize: function(val) {
            var that = this;

            if(val !== undefined) {
                that._query({ pageSize: val, page: 1 });
                return;
            }

            return that.take();
        },

        sort: function(val) {
            var that = this;

            if(val !== undefined) {
                that._query({ sort: val });
                return;
            }

            return that._sort;
        },

        filter: function(val) {
            var that = this;

            if (val === undefined) {
                return that._filter;
            }

            that._query({ filter: val, page: 1 });
        },

        group: function(val) {
            var that = this;

            if(val !== undefined) {
                that._query({ group: val });
                return;
            }

            return that._group;
        },

        total: function() {
            return this._total || 0;
        },

        aggregate: function(val) {
            var that = this;

            if(val !== undefined) {
                that._query({ aggregate: val });
                return;
            }

            return that._aggregate;
        },

        aggregates: function() {
            return this._aggregateResult;
        },

        totalPages: function() {
            var that = this,
            pageSize = that.pageSize() || that.total();

            return math.ceil((that.total() || 0) / pageSize);
        },

        inRange: function(skip, take) {
            var that = this,
            end = math.min(skip + take, that.total());

            if (!that.options.serverPaging && that.data.length > 0) {
                return true;
            }

            return that._findRange(skip, end).length > 0;
        },

        range: function(skip, take) {
            skip = math.min(skip || 0, this.total());
            var that = this,
            pageSkip = math.max(math.floor(skip / take), 0) * take,
            size = math.min(pageSkip + take, that.total()),
            data;

            data = that._findRange(skip, math.min(skip + take, that.total()));

            if (data.length) {
                that._skip = skip > that.skip() ? math.min(size, (that.totalPages() - 1) * that.take()) : pageSkip;

                that._take = take;

                var paging = that.options.serverPaging;
                var sorting = that.options.serverSorting;
                try {
                    that.options.serverPaging = true;
                    that.options.serverSorting = true;
                    if (paging) {
                        that._data = data = that._observe(data);
                    }
                    that._process(data);
                } finally {
                    that.options.serverPaging = paging;
                    that.options.serverSorting = sorting;
                }

                return;
            }

            if (take !== undefined) {
                if (!that._rangeExists(pageSkip, size)) {
                    that.prefetch(pageSkip, take, function() {
                        if (skip > pageSkip && size < that.total() && !that._rangeExists(size, math.min(size + take, that.total()))) {
                            that.prefetch(size, take, function() {
                                that.range(skip, take);
                            });
                        } else {
                            that.range(skip, take);
                        }
                    });
                } else if (pageSkip < skip) {
                    that.prefetch(size, take, function() {
                        that.range(skip, take);
                    });
                }
            }
        },

        _findRange: function(start, end) {
            var that = this,
                ranges = that._ranges,
                range,
                data = [],
                skipIdx,
                takeIdx,
                startIndex,
                endIndex,
                rangeData,
                rangeEnd,
                processed,
                options = that.options,
                remote = options.serverSorting || options.serverPaging || options.serverFiltering || options.serverGrouping || options.serverAggregates,
                length;

            for (skipIdx = 0, length = ranges.length; skipIdx < length; skipIdx++) {
                range = ranges[skipIdx];
                if (start >= range.start && start <= range.end) {
                    var count = 0;

                    for (takeIdx = skipIdx; takeIdx < length; takeIdx++) {
                        range = ranges[takeIdx];

                        if (range.data.length && start + count >= range.start /*&& count + count <= range.end*/) {
                            rangeData = range.data;
                            rangeEnd = range.end;

                            if (!remote) {
                                processed = process(range.data, { sort: that.sort(), filter: that.filter() });
                                rangeData = processed.data;

                                if (processed.total !== undefined) {
                                    rangeEnd = processed.total;
                                }
                            }

                            startIndex = 0;
                            if (start + count > range.start) {
                                startIndex = (start + count) - range.start;
                            }
                            endIndex = rangeData.length;
                            if (rangeEnd > end) {
                                endIndex = endIndex - (rangeEnd - end);
                            }
                            count += endIndex - startIndex;
                            data = data.concat(rangeData.slice(startIndex, endIndex));

                            if (end <= range.end && count == end - start) {
                                return data;
                            }
                        }
                    }
                    break;
                }
            }
            return [];
        },

        skip: function() {
            var that = this;

            if (that._skip === undefined) {
                return (that._page !== undefined ? (that._page  - 1) * (that.take() || 1) : undefined);
            }
            return that._skip;
        },

        take: function() {
            var that = this;
            return that._take || that._pageSize;
        },

        prefetch: function(skip, take, callback) {
            var that = this,
            size = math.min(skip + take, that.total()),
            range = { start: skip, end: size, data: [] },
            options = {
                take: take,
                skip: skip,
                page: skip / take + 1,
                pageSize: take,
                sort: that._sort,
                filter: that._filter,
                group: that._group,
                aggregate: that._aggregate
            };

            if (!that._rangeExists(skip, size)) {
                clearTimeout(that._timeout);

                that._timeout = setTimeout(function() {
                    that._queueRequest(options, function() {
                        that.transport.read({
                            data: options,
                            success: function (data) {
                                that._dequeueRequest();
                                var found = false;
                                for (var i = 0, len = that._ranges.length; i < len; i++) {
                                    if (that._ranges[i].start === skip) {
                                        found = true;
                                        range = that._ranges[i];
                                        break;
                                    }
                                }
                                if (!found) {
                                    that._ranges.push(range);
                                }

                                data = that.reader.parse(data);
                                range.data = that._observe(that.reader.data(data));
                                range.end = range.start + range.data.length;
                                that._ranges.sort( function(x, y) { return x.start - y.start; } );
                                that._total = that.reader.total(data);
                                if (callback) {
                                    callback();
                                }
                            }
                        });
                    });
                }, 100);
            } else if (callback) {
                callback();
            }
        },

        _rangeExists: function(start, end) {
            var that = this,
            ranges = that._ranges,
            idx,
            length;

            for (idx = 0, length = ranges.length; idx < length; idx++) {
                if (ranges[idx].start <= start && ranges[idx].end >= end) {
                    return true;
                }
            }
            return false;
        }
    });

    DataSource.create = function(options) {
        options = options && options.push ? { data: options } : options;

        var dataSource = options || {},
        data = dataSource.data,
        fields = dataSource.fields,
        table = dataSource.table,
        select = dataSource.select,
        idx,
        length,
        model = {},
        field;

        if (!data && fields && !dataSource.transport) {
            if (table) {
                data = inferTable(table, fields);
            } else if (select) {
                data = inferSelect(select, fields);
            }
        }

        if (kendo.data.Model && fields && (!dataSource.schema || !dataSource.schema.model)) {
            for (idx = 0, length = fields.length; idx < length; idx++) {
                field = fields[idx];
                if (field.type) {
                    model[field.field] = field;
                }
            }

            if (!isEmptyObject(model)) {
                dataSource.schema = extend(true, dataSource.schema, { model:  { fields: model } });
            }
        }

        dataSource.data = data;

        return dataSource instanceof DataSource ? dataSource : new DataSource(dataSource);
    };

    function inferSelect(select, fields) {
        var options = $(select)[0].children,
            idx,
            length,
            data = [],
            record,
            firstField = fields[0],
            secondField = fields[1],
            value,
            option;

        for (idx = 0, length = options.length; idx < length; idx++) {
            record = {};
            option = options[idx];

            record[firstField.field] = option.text;

            value = option.attributes.value;

            if (value && value.specified) {
                value = option.value;
            } else {
                value = option.text;
            }

            record[secondField.field] = value;

            data.push(record);
        }

        return data;
    }

    function inferTable(table, fields) {
        var tbody = $(table)[0].tBodies[0],
        rows = tbody ? tbody.rows : [],
        idx,
        length,
        fieldIndex,
        fieldCount = fields.length,
        data = [],
        cells,
        record,
        cell,
        empty;

        for (idx = 0, length = rows.length; idx < length; idx++) {
            record = {};
            empty = true;
            cells = rows[idx].cells;

            for (fieldIndex = 0; fieldIndex < fieldCount; fieldIndex++) {
                cell = cells[fieldIndex];
                if(cell.nodeName.toLowerCase() !== "th") {
                    empty = false;
                    record[fields[fieldIndex].field] = cell.innerHTML;
                }
            }
            if(!empty) {
                data.push(record);
            }
        }

        return data;
    }

    var Node = Model.define({
        init: function(value) {
            var that = this,
                hasChildren = that.hasChildren || value.hasChildren,
                data = "items",
                children = {};

            kendo.data.Model.fn.init.call(that, value);

            if (typeof that.children === STRING) {
               data = that.children;
            }

            children = extend({
                schema: {
                    data: data,
                    model: {
                        hasChildren: hasChildren
                    }
                }
            }, that.children, { data: value });

            if (!hasChildren) {
                hasChildren = children.schema.data;
            }

            if (typeof hasChildren === STRING) {
                hasChildren = kendo.getter(hasChildren);
            }

            if (isFunction(hasChildren)) {
                that.hasChildren = !!hasChildren.call(that, that);
            }

            that.children = new HierarchicalDataSource(children);
            that.children._parent = function(){
                return that;
            };

            that.children.bind(CHANGE, function(e){
                e.node = e.node || that;
                that.trigger(CHANGE, e);
            });

            that._loaded = !!(value && value[data]);
        },

        hasChildren: false,

        level: function() {
            var parentNode = this.parentNode(),
                level = 0;

            while (parentNode) {
                level++;
                parentNode = parentNode.parentNode();
            }

            return level;
        },

        load: function() {
            var that = this, options = {};

            options[that.idField || "id"] = that.id;

            if (!that._loaded) {
                that.children._data = undefined;
            }

            that.children.one(CHANGE, function() {
                that._loaded = true;
            }).query(options);
        },

        parentNode: function() {
            var array = this.parent();

            return array.parent();
        },

        loaded: function(value) {
            if (value !== undefined) {
                this._loaded = value;
            } else {
                return this._loaded;
            }
        },

        shouldSerialize: function(field) {
            return Model.fn.shouldSerialize.call(this, field) && field !== "children" && field !== "_loaded" && field !== "hasChildren";
        }
    });

    var HierarchicalDataSource = DataSource.extend({
        init: function(options) {
            var node = Node.define({
                children: options
            });

            DataSource.fn.init.call(this, extend(true, {}, { schema: { modelBase: node, model: node } }, options));
        },

        remove: function(node){
            var parentNode = node.parentNode(),
                dataSource = this,
                result;

            if (parentNode) {
                dataSource = parentNode.children;
            }

            result = DataSource.fn.remove.call(dataSource, node);

            if (parentNode && !dataSource.data().length) {
                parentNode.hasChildren = false;
            }

            return result;
        },

        insert: function(index, model) {
            var parentNode = this._parent();

            if (parentNode) {
                parentNode.hasChildren = true;
            }

            return DataSource.fn.insert.call(this, index, model);
        },

        getByUid: function(uid) {
            var idx, length, node, data;

            node = DataSource.fn.getByUid.call(this, uid);

            if (node) {
                return node;
            }

            data = this._flatData(this.data());

            for (idx = 0, length = data.length; idx < length; idx++) {
                node = data[idx].children.getByUid(uid);
                if (node) {
                    return node;
                }
            }
        }
    });

    function inferList(list, fields) {
        var items = $(list).children(),
            idx,
            length,
            data = [],
            record,
            textField = fields[0].field,
            urlField = fields[1] && fields[1].field,
            spriteCssClassField = fields[2] && fields[2].field,
            imageUrlField = fields[3] && fields[3].field,
            item,
            id,
            textChild,
            className,
            children;

        for (idx = 0, length = items.length; idx < length; idx++) {
            record = {};
            item = items.eq(idx);

            textChild = item[0].firstChild;
            children = item.children();
            list = children.filter("ul");
            children = children.filter(":not(ul)");

            id = item.attr("data-id");

            if (id) {
                record.id = id;
            }

            if (textChild) {
                record[textField] = textChild.nodeType == 3 ? textChild.nodeValue : children.text();
            }

            if (urlField) {
                record[urlField] = children.find("a").attr("href");
            }

            if (imageUrlField) {
                record[imageUrlField] = children.find("img").attr("src");
            }

            if (spriteCssClassField) {
                className = children.find(".k-sprite").prop("className");
                record[spriteCssClassField] = className && $.trim(className.replace("k-sprite", ""));
            }

            if (list.length) {
                record.items = inferList(list.eq(0), fields);
            }

            if (item.attr("data-hasChildren") == "true") {
                record.hasChildren = true;
            }

            data.push(record);
        }

        return data;
    }

    HierarchicalDataSource.create = function(options) {
        options = options && options.push ? { data: options } : options;

        var dataSource = options || {},
            data = dataSource.data,
            fields = dataSource.fields,
            list = dataSource.list;

        if (!data && fields && !dataSource.transport) {
            if (list) {
                data = inferList(list, fields);
            }
        }

        dataSource.data = data;

        return dataSource instanceof HierarchicalDataSource ? dataSource : new HierarchicalDataSource(dataSource);
    };

    extend(true, kendo.data, /** @lends kendo.data */ {
        readers: {
            json: DataReader
        },
        Query: Query,
        DataSource: DataSource,
        HierarchicalDataSource: HierarchicalDataSource,
        Node: Node,
        ObservableObject: ObservableObject,
        ObservableArray: ObservableArray,
        LocalTransport: LocalTransport,
        RemoteTransport: RemoteTransport,
        Cache: Cache,
        DataReader: DataReader,
        Model: Model
    });
})(jQuery);
(function ($, unefined) {
    var kendo = window.kendo,
        Observable = kendo.Observable,
        ObservableObject = kendo.data.ObservableObject,
        ObservableArray = kendo.data.ObservableArray,
        toString = {}.toString,
        binders = {},
        Class = kendo.Class,
        innerText,
        proxy = $.proxy,
        VALUE = "value",
        CHECKED = "checked",
        CHANGE = "change";

    (function() {
        var a = document.createElement("a");
        if (a.innerText !== undefined) {
            innerText = "innerText";
        } else if (a.textContent !== undefined) {
            innerText = "textContent";
        }
    })();

    var Binding = Observable.extend( {
        init: function(source, path) {
            var that = this;

            Observable.fn.init.call(that);

            that.source = source;
            that.path = path;
            that.dependencies = {};
            that.dependencies[path] = true;
            that.observable = that.source instanceof Observable;

            that._access = function(e) {
                that.dependencies[e.field] = true;
            };

            if (that.observable) {
                that._change = function(e) {
                    that.change(e);
                };

                that.source.bind(CHANGE, that._change);
            }
        },

        change: function(e) {
            var dependency,
                idx,
                ch,
                that = this;

            if (that.path === "this") {
                that.trigger(CHANGE, e);
            } else {
                for (dependency in that.dependencies) {
                    idx = dependency.indexOf(e.field);

                    if (idx === 0) {
                       ch = dependency.charAt(e.field.length);

                       if (!ch || ch === "." || ch === "[") {
                            that.trigger(CHANGE, e);
                            break;
                       }
                    }
                }
            }
        },

        start: function() {
            if (this.observable) {
                this.source.bind("get", this._access);
            }
        },

        stop: function() {
            if (this.observable) {
                this.source.unbind("get", this._access);
            }
        },

        get: function() {
            var that = this,
                source = that.source,
                index,
                path = that.path,
                result = source;

            that.start();

            if (that.observable) {
                result = source.get(path);

                // Traverse the observable hierarchy if the binding is not resolved at the current level.
                while (result === undefined && source) {
                    source = source.parent();

                    if (source instanceof ObservableObject) {
                        result = source.get(path);
                    }
                }

                // If the result is a function - invoke it
                if (typeof result === "function") {
                    index = path.lastIndexOf(".");

                    // If the function is a member of a nested observable object make that nested observable the context (this) of the function
                    if (index > 0) {
                        source = source.get(path.substring(0, index));
                    }

                    // Set the context (this) of the function
                    result = proxy(result, source);

                    // Invoke the function
                    result = result(that.source);
                }

                // If the binding is resolved by a parent object
                if (source && source !== that.source) {
                    // Listen for changes in the parent object

                    source.unbind(CHANGE, that._change)
                          .bind(CHANGE, that._change);
                }
            }

            that.stop();

            return result;
        },

        set: function(value) {
            this.source.set(this.path, value);
        },

        destroy: function() {
            if (this.observable) {
                this.source.unbind(CHANGE, this._change);
            }
        }
    });

    var EventBinding = Binding.extend( {
        get: function() {
            var source = this.source,
                path = this.path,
                handler;

            handler = source.get(path);

            while (!handler && source) {
                source = source.parent();
                if (source instanceof ObservableObject) {
                    handler = source.get(path);
                }
            }

            return proxy(handler, source);
        }
    });

    var TemplateBinding = Binding.extend( {
        init: function(source, path, template) {
            var that = this;

            Binding.fn.init.call(that, source, path);

            that.template = template;
        },

        render: function(value) {
            var html;

            this.start();

            html = kendo.render(this.template, value);

            this.stop();

            return html;
        }
    });

    var Binder = Class.extend({
        init: function(element, bindings, options) {
            this.element = element;
            this.bindings = bindings;
            this.options = options;
        },

        bind: function(binding, attribute) {
            var that = this;

            binding = attribute ? binding[attribute] : binding;

            binding.bind(CHANGE, function(e) {
                that.refresh(attribute || e);
            });

            that.refresh(attribute);
        },

        destroy: function() {
        }
    });

    binders.attr = Binder.extend({
        refresh: function(key) {
            this.element.setAttribute(key, this.bindings.attr[key].get());
        }
    });

    binders.style = Binder.extend({
        refresh: function(key) {
            this.element.style[key] = this.bindings.style[key].get();
        }
    });

    binders.enabled = Binder.extend({
        refresh: function() {
            if (this.bindings.enabled.get()) {
                this.element.removeAttribute("disabled");
            } else {
                this.element.setAttribute("disabled", "disabled");
            }
        }
    });

    binders.disabled = Binder.extend({
        refresh: function() {
            if (this.bindings.disabled.get()) {
                this.element.setAttribute("disabled", "disabled");
            } else {
                this.element.removeAttribute("disabled");
            }
        }
    });

    binders.events = Binder.extend({
        init: function(element, bindings, options) {
            Binder.fn.init.call(this, element, bindings, options);
            this.handlers = {};
        },

        refresh: function(key) {
            var binding = this.bindings.events[key],
                handler = this.handlers[key] = binding.get();

            $(this.element).bind(key, binding.source, handler);
        },

        destroy: function() {
            var element = $(this.element),
                handler;

            for (handler in this.handlers) {
                element.unbind(handler, this.handlers[handler]);
            }
        }
    });

    binders.text = Binder.extend({
        refresh: function() {
            var text = this.bindings.text.get();

            if (text == null) {
                text = "";
            }

            this.element[innerText] = text;
        }
    });

    binders.visible = Binder.extend({
        refresh: function() {
            if (this.bindings.visible.get()) {
                this.element.style.display = "";
            } else {
                this.element.style.display = "none";
            }
        }
    });

    binders.invisible = Binder.extend({
        refresh: function() {
            if (!this.bindings.invisible.get()) {
                this.element.style.display = "";
            } else {
                this.element.style.display = "none";
            }
        }
    });

    binders.html = Binder.extend({
        refresh: function() {
            this.element.innerHTML = this.bindings.html.get();
        }
    });

    binders.value = Binder.extend({
        init: function(element, bindings, options) {
            Binder.fn.init.call(this, element, bindings, options);

            this._change = proxy(this.change, this);
            this.eventName = options.valueUpdate || CHANGE;

            $(this.element).bind(this.eventName, this._change);

            this._initChange = false;
        },

        change: function() {
            this._initChange = this.eventName != CHANGE;
            this.bindings[VALUE].set(this.element.value);
            this._initChange = false;
        },

        refresh: function() {
            if (!this._initChange) {
                var value = this.bindings[VALUE].get();

                if (value == null) {
                    value = "";
                }

                this.element.value = value;
            }

            this._initChange = false;
        },

        destroy: function() {
            $(this.element).unbind(this.eventName, this._change);
        }
    });

    binders.source = Binder.extend({
        init: function(element, bindings, options) {
            Binder.fn.init.call(this, element, bindings, options);
        },

        refresh: function(e) {
            var that = this,
                source = that.bindings.source.get();

            if (source instanceof ObservableArray) {
                e = e || {};

                if (e.action == "add") {
                    that.add(e.index, e.items);
                } else if (e.action == "remove") {
                    that.remove(e.index, e.items);
                } else if (e.action != "itemchange") {
                    that.render();
                }
            } else {
                that.render();
            }
        },

        container: function() {
            var element = this.element;

            if (element.nodeName.toLowerCase() == "table") {
                if (!element.tBodies[0]) {
                    element.appendChild(document.createElement("tbody"));
                }
                element = element.tBodies[0];
            }

            return element;
        },

        template: function() {
            var options = this.options,
                template = options.template,
                nodeName = this.container().nodeName.toLowerCase();

            if (!template) {
                if (nodeName == "select") {
                    if (options.valueField || options.textField) {
                        template = kendo.format('<option value="#:{0}#">#:{1}#</option>',
                            options.valueField || options.textField, options.textField || options.valueField);
                    } else {
                        template = "<option>#:data#</option>";
                    }
                } else if (nodeName == "tbody") {
                    template = "<tr><td>#:data#</td></tr>";
                } else if (nodeName == "ul" || nodeName == "ol") {
                    template = "<li>#:data#</li>";
                } else {
                    template = "#:data#";
                }

                template = kendo.template(template);
            }

            return template;
        },

        destroy: function() {
            var source = this.bindings.source.get();

            source.unbind(CHANGE, this._change);
        },

        add: function(index, items) {
            var element = this.container(),
                idx,
                length,
                child,
                clone = element.cloneNode(false),
                reference = element.children[index];

            $(clone).html(kendo.render(this.template(), items));

            if (clone.children.length) {
                for (idx = 0, length = items.length; idx < length; idx++) {
                    child = clone.children[0];
                    element.insertBefore(child, reference || null);
                    bindElement(child, items[idx]);
                }
            }
        },

        remove: function(index, items) {
            var idx,
            element = this.container();

            for (idx = 0; idx < items.length; idx++) {
                element.removeChild(element.children[index]);
            }
        },

        render: function() {
            var source = this.bindings.source.get(),
                 idx,
                 length,
                 element = this.container(),
                 template = this.template(),
                 parent;

            if (!(source instanceof ObservableArray) && toString.call(source) !== "[object Array]") {
                if (source.parent) {
                    parent = source.parent;
                }

                source = new ObservableArray([source]);

                if (source.parent) {
                    source.parent = parent;
                }
            }

            if (this.bindings.template) {
                $(element).html(this.bindings.template.render(source));

                if (element.children.length) {
                    for (idx = 0, length = source.length; idx < length; idx++) {
                        bindElement(element.children[idx], source[idx]);
                    }
                }
            }
            else {
                $(element).html(kendo.render(template, source));
            }
        }
    });

    binders.input = {
        checked: Binder.extend({
            init: function(element, bindings, options) {
                Binder.fn.init.call(this, element, bindings, options);
                this._change = proxy(this.change, this);

                $(this.element).change(this._change);
            },
            change: function() {
                var element = this.element;
                var value = this.value();

                if (element.type == "radio") {
                    this.bindings[CHECKED].set(value);
                } else if (element.type == "checkbox") {
                    var source = this.bindings[CHECKED].get();
                    var index;

                    if (source instanceof ObservableArray) {
                        if (value !== false && value !== true) {
                            index = source.indexOf(value);
                            if (index > -1) {
                                source.splice(index, 1);
                            } else {
                                source.push(value);
                            }
                        }
                    } else {
                        this.bindings[CHECKED].set(value);
                    }
                }
            },

            refresh: function() {
                var value = this.bindings[CHECKED].get();
                var element = this.element;

                if (element.type == "checkbox") {
                    if (value instanceof ObservableArray) {
                        if (value.indexOf(this.value(element)) >= 0) {
                            value = true;
                        }
                    }

                    element.checked = value === true;
                } else if (element.type == "radio" && value != null) {
                    if (element.value === value.toString()) {
                        element.checked = true;
                    }
                }
            },

            value: function() {
                var element = this.element,
                    value = element.value;

                if (element.type == "checkbox") {
                    if (value == "on" || value == "off" || value === "true") {
                        value = element.checked;
                    }
                }

                return value;
            },
            destroy: function() {
                $(this.element).unbind(CHANGE, this._change);
            }
        })
    };

    binders.select = {
        value: Binder.extend({
            init: function(target, bindings, options) {
                Binder.fn.init.call(this, target, bindings, options);

                this._change = proxy(this.change, this);
                $(this.element).change(this._change);
            },

            change: function() {
                var values = [],
                    element = this.element,
                    source,
                    field = this.options.valueField || this.options.textField,
                    option,
                    valueIndex,
                    value,
                    idx,
                    length;

                for (idx = 0, length = element.options.length; idx < length; idx++) {
                    option = element.options[idx];

                    if (option.selected) {
                        value = option.attributes.value;

                        if (value && value.specified) {
                            value = option.value;
                        } else {
                            value = option.text;
                        }

                        values.push(value);
                    }
                }

                if (field) {
                    source = this.bindings.source.get();
                    for (valueIndex = 0; valueIndex < values.length; valueIndex++) {
                        for (idx = 0, length = source.length; idx < length; idx++) {
                            if (source[idx].get(field) == values[valueIndex]) {
                                values[valueIndex] = source[idx];
                                break;
                            }
                        }
                    }
                }

                value = this.bindings[VALUE].get();
                if (value instanceof ObservableArray) {
                    value.splice.apply(value, [0, value.length].concat(values));
                } else if (value instanceof ObservableObject || !field) {
                    this.bindings[VALUE].set(values[0]);
                } else {
                    this.bindings[VALUE].set(values[0].get(field));
                }
            },
            refresh: function() {
                var optionIndex,
                    element = this.element,
                    options = element.options,
                    value = this.bindings[VALUE].get(),
                    values = value,
                    field = this.options.valueField || this.options.textField,
                    optionValue;

                if (!(values instanceof ObservableArray)) {
                    values = new ObservableArray([value]);
                }

                for (var valueIndex = 0; valueIndex < values.length; valueIndex++) {
                    value = values[valueIndex];

                    if (field && value instanceof ObservableObject) {
                        value = value.get(field);
                    }

                    for (optionIndex = 0; optionIndex < options.length; optionIndex++) {
                        optionValue = options[optionIndex].value;
                        if (optionValue === "" && value !== "") {
                            optionValue = options[optionIndex].text;
                        }

                        if (optionValue == value) {
                            options[optionIndex].selected = true;
                        }
                    }
                }
            },
            destroy: function() {
                $(this.element).unbind(CHANGE, this._change);
            }
        })
    };

    binders.widget = {
        events : Binder.extend({
            init: function(widget, bindings, options) {
                Binder.fn.init.call(this, widget.element[0], bindings, options);
                this.widget = widget;
                this.handlers = {};
            },

            refresh: function(key) {
                var binding = this.bindings.events[key],
                    handler = binding.get();

                this.handlers[key] = function(e) {
                    e.data = binding.source;

                    handler(e);
                };

                this.widget.bind(key, this.handlers[key]);
            },

            destroy: function() {
                var handler;

                for (handler in this.handlers) {
                    this.widget.unbind(handler, this.handlers[handler]);
                }
            }
        }),

        checked: Binder.extend({
            init: function(widget, bindings, options) {
                Binder.fn.init.call(this, widget.element[0], bindings, options);

                this.widget = widget;
                this._change = proxy(this.change, this);
                this.widget.bind(CHANGE, this._change);
            },
            change: function() {
                this.bindings[CHECKED].set(this.value());
            },

            refresh: function() {
                this.widget.check(this.bindings[CHECKED].get() === true);
            },

            value: function() {
                var element = this.element,
                    value = element.value;

                if (value == "on" || value == "off") {
                    value = element.checked;
                }

                return value;
            },

            destroy: function() {
                this.widget.unbind(CHANGE, this._change);
            }
        }),

        visible: Binder.extend({
            init: function(widget, bindings, options) {
                Binder.fn.init.call(this, widget.element[0], bindings, options);

                this.widget = widget;
            },

            refresh: function() {
                var visible = this.bindings.visible.get();
                this.widget.wrapper[0].style.display = visible ? "" : "none";
            }
        }),

        invisible: Binder.extend({
            init: function(widget, bindings, options) {
                Binder.fn.init.call(this, widget.element[0], bindings, options);

                this.widget = widget;
            },

            refresh: function() {
                var invisible = this.bindings.invisible.get();
                this.widget.wrapper[0].style.display = invisible ? "none" : "";
            }
        }),

        enabled: Binder.extend({
            init: function(widget, bindings, options) {
                Binder.fn.init.call(this, widget.element[0], bindings, options);

                this.widget = widget;
            },

            refresh: function() {
                if (this.widget.enable) {
                    this.widget.enable(this.bindings.enabled.get());
                }
            }
        }),

        disabled: Binder.extend({
            init: function(widget, bindings, options) {
                Binder.fn.init.call(this, widget.element[0], bindings, options);

                this.widget = widget;
            },

            refresh: function() {
                if (this.widget.enable) {
                    this.widget.enable(!this.bindings.disabled.get());
                }
            }
        }),

        source: Binder.extend({
            init: function(widget, bindings, options) {
                var that = this;

                Binder.fn.init.call(that, widget.element[0], bindings, options);

                that.widget = widget;
                that._dataBinding = proxy(that.dataBinding, that);
                that._dataBound = proxy(that.dataBound, that);
                that._itemChange = proxy(that.itemChange, that);
            },

            itemChange: function(e) {
                bindElement(e.item[0], e.data, e.ns || kendo.ui);
            },

            dataBinding: function() {
                var idx,
                    length,
                    widget = this.widget,
                    items = widget.items();

                for (idx = 0, length = items.length; idx < length; idx++) {
                    unbindElementTree(items[idx]);
                }
            },

            dataBound: function(e) {
                var idx,
                    length,
                    widget = this.widget,
                    items = widget.items(),
                    dataSource = widget.dataSource,
                    view = dataSource.view(),
                    ns = e.ns || kendo.ui,
                    groups = dataSource.group() || [];

                if (items.length) {
                    if (groups.length) {
                        view = flattenGroups(view);
                    }

                    for (idx = 0, length = view.length; idx < length; idx++) {
                        bindElement(items[idx], view[idx], ns);
                    }
                }
            },

            refresh: function(e) {
                var that = this,
                    source,
                    widget = that.widget;

                e = e || {};

                if (!e.action) {
                    that.destroy();

                    widget.bind("dataBinding", that._dataBinding);
                    widget.bind("dataBound", that._dataBound);
                    widget.bind("itemChange", that._itemChange);

                    if (widget.dataSource instanceof kendo.data.DataSource) {
                        source = that.bindings.source.get();
                        if (source instanceof kendo.data.DataSource) {
                            widget.setDataSource(source);
                        } else {
                            widget.dataSource.data(source);
                        }
                    }
                }
            },

            destroy: function() {
                var widget = this.widget;

                widget.unbind("dataBinding", this._dataBinding);
                widget.unbind("dataBound", this._dataBound);
                widget.unbind("itemChange", this._itemChange);
            }
        }),

        value: Binder.extend({
            init: function(widget, bindings, options) {
                Binder.fn.init.call(this, widget.element[0], bindings, options);

                this.widget = widget;
                this._change = $.proxy(this.change, this);
                this.widget.first(CHANGE, this._change);

                var value = this.bindings.value.get();
                this._valueIsObservableObject = value == null || value instanceof ObservableObject;
            },

            change: function() {
                var value = this.widget.value();
                var idx, length;

                var field = this.options.dataValueField || this.options.dataTextField;

                if (field) {
                    var source,
                        isObservableObject = this._valueIsObservableObject;

                    if (this.bindings.source) {
                        source = this.bindings.source.get();
                    }

                    if (value === "" && isObservableObject) {
                        value = null;
                    } else {
                        if (!source || source instanceof kendo.data.DataSource) {
                            source = this.widget.dataSource.view();
                        }

                        for (idx = 0, length = source.length; idx < length; idx++) {
                            if (source[idx].get(field) == value) {
                                if (isObservableObject) {
                                    value = source[idx];
                                } else {
                                    value = source[idx].get(field);
                                }
                                break;
                            }
                        }
                    }
                }

                this.bindings.value.set(value);
            },

            refresh: function() {
                var field = this.options.dataValueField || this.options.dataTextField;
                var value = this.bindings.value.get();

                if (field && value instanceof ObservableObject) {
                    value = value.get(field);
                }

                this.widget.value(value);
            },

            destroy: function() {
                this.widget.unbind(CHANGE, this._change);
            }
        })
    };

    var BindingTarget = Class.extend( {
        init: function(target, options) {
            this.target = target;
            this.options = options;
            this.toDestroy = [];
        },

        bind: function(bindings) {
            var nodeName = this.target.nodeName.toLowerCase(),
                key,
                specificBinders = binders[nodeName] || {};

            for (key in bindings) {
                this.applyBinding(key, bindings, specificBinders);
            }
        },

        applyBinding: function(name, bindings, specificBinders) {
            var binder = specificBinders[name] || binders[name],
                toDestroy = this.toDestroy,
                attribute,
                binding = bindings[name];

            if (binder) {
                binder = new binder(this.target, bindings, this.options);

                toDestroy.push(binder);

                if (binding instanceof Binding) {
                    binder.bind(binding);
                    toDestroy.push(binding);
                } else {
                    for (attribute in binding) {
                        binder.bind(binding, attribute);
                        toDestroy.push(binding[attribute]);
                    }
                }
            } else if (name !== "template") {
                throw new Error("The " + name + " binding is not supported by the " + this.target.nodeName.toLowerCase() + " element");
            }
        },

        destroy: function() {
            var idx,
                length,
                toDestroy = this.toDestroy;

            for (idx = 0, length = toDestroy.length; idx < length; idx++) {
                toDestroy[idx].destroy();
            }
        }
    });

    var WidgetBindingTarget = BindingTarget.extend( {
        bind: function(bindings) {
            var that = this,
                binding,
                hasValue = false,
                hasSource = false;

            for (binding in bindings) {
                if (binding == VALUE) {
                    hasValue = true;
                } else if (binding == "source") {
                    hasSource = true;
                } else {
                    that.applyBinding(binding, bindings);
                }
            }

            if (hasSource) {
                that.applyBinding("source", bindings);
            }

            if (hasValue) {
                that.applyBinding(VALUE, bindings);
            }
        },

        applyBinding: function(name, bindings) {
            var binder = binders.widget[name],
                toDestroy = this.toDestroy,
                attribute,
                binding = bindings[name];

            if (binder) {
                binder = new binder(this.target, bindings, this.target.options);

                toDestroy.push(binder);


                if (binding instanceof Binding) {
                    binder.bind(binding);
                    toDestroy.push(binding);
                } else {
                    for (attribute in binding) {
                        binder.bind(binding, attribute);
                        toDestroy.push(binding[attribute]);
                    }
                }
            } else {
                throw new Error("The " + name + " binding is not supported by the " + this.target.options.name + " widget");
            }
        }
    });

    function flattenGroups(data) {
        var idx, length, result = [];

        for (idx = 0, length = data.length; idx < length; idx++) {
            if (data[idx].hasSubgroups) {
                result = result.concat(flattenGroups(data[idx].items));
            } else {
                result = result.concat(data[idx].items);
            }
        }
        return result;
    }

    function bindingTargetForRole(role, element, namespace) {
        var roles = namespace.roles,
            type = roles[role];

        if (type) {
            return new WidgetBindingTarget(kendo.initWidget(element, type.options, roles));
        }
    }

    var keyValueRegExp = /[A-Za-z0-9_\-]+:(\{([^}]*)\}|[^,}]+)/g,
        whiteSpaceRegExp = /\s/g;

    function parseBindings(bind) {
        var result = {},
            idx,
            length,
            token,
            colonIndex,
            key,
            value,
            tokens;

        tokens = bind.match(keyValueRegExp);

        for (idx = 0, length = tokens.length; idx < length; idx++) {
            token = tokens[idx];
            colonIndex = token.indexOf(":");

            key = token.substring(0, colonIndex);
            value = token.substring(colonIndex + 1);

            if (value.charAt(0) == "{") {
                value = parseBindings(value);
            }

            result[key] = value;
        }

        return result;
    }

    function createBindings(bindings, source, type) {
        var binding,
            result = {};

        for (binding in bindings) {
            result[binding] = new type(source, bindings[binding]);
        }

        return result;
    }

    function bindElement(element, source, namespace) {
        var role = element.getAttribute("data-" + kendo.ns + "role"),
            idx,
            bind = element.getAttribute("data-" + kendo.ns + "bind"),
            children = element.children,
            deep = true,
            bindings,
            options = {},
            target;

        if (!namespace) {
            namespace = kendo.ui;
        }

        if (role || bind) {
            unbindElement(element);
        }

        if (role) {
            target = bindingTargetForRole(role, element, namespace);
        }

        if (bind) {
            bind = parseBindings(bind.replace(whiteSpaceRegExp, ""));

            if (!target) {
                options = kendo.parseOptions(element, { textField: "", valueField: "", template: "", valueUpdate: CHANGE});
                target = new BindingTarget(element, options);
            }

            target.source = source;

            bindings = createBindings(bind, source, Binding);

            if (options.template) {
                bindings.template = new TemplateBinding(source, "", options.template);
            }

            if (bindings.click) {
                bind.events = bind.events || {};
                bind.events.click = bind.click;
                delete bindings.click;
            }

            if (bindings.source) {
                deep = false;
            }

            if (bind.attr) {
                bindings.attr = createBindings(bind.attr, source, Binding);
            }

            if (bind.style) {
                bindings.style = createBindings(bind.style, source, Binding);
            }

            if (bind.events) {
                bindings.events = createBindings(bind.events, source, EventBinding);
            }

            target.bind(bindings);
        }

        if (target) {
            element.kendoBindingTarget = target;
        }

        if (deep && children) {
            for (idx = 0; idx < children.length; idx++) {
                bindElement(children[idx], source, namespace);
            }
        }
    }

    function bind(dom, object, namespace) {
        var idx, length;

        object = kendo.observable(object);
        dom = $(dom);

        for (idx = 0, length = dom.length; idx < length; idx++ ) {
            bindElement(dom[idx], object, namespace);
        }
    }

    function unbindElement(element) {
        var bindingTarget = element.kendoBindingTarget;

        if (bindingTarget) {
            bindingTarget.destroy();

            if ($.support.deleteExpando) {
                delete element.kendoBindingTarget;
            } else if (element.removeAttribute) {
                element.removeAttribute("kendoBindingTarget");
            } else {
                element.kendoBindingTarget = null;
            }
        }
    }

    function unbindElementTree(element) {
        var idx,
            length,
            children = element.children;

        unbindElement(element);

        if (children) {
            for (idx = 0, length = children.length; idx < length; idx++) {
                unbindElementTree(children[idx]);
            }
        }
    }

    function unbind(dom) {
        var idx, length;

        dom = $(dom);

        for (idx = 0, length = dom.length; idx < length; idx++ ) {
            unbindElementTree(dom[idx]);
        }
    }

    function notify(widget, namespace) {
        var element = widget.element,
            bindingTarget = element[0].kendoBindingTarget;

        if (bindingTarget) {
            bind(element, bindingTarget.source, namespace);
        }
    }

    kendo.unbind = unbind;
    kendo.bind = bind;
    kendo.data.binders = binders;
    kendo.data.Binder = Binder;
    kendo.notify = notify;

    kendo.observable = function(object) {
        if (!(object instanceof ObservableObject)) {
            object = new ObservableObject(object);
        }

        return object;
    };

})(jQuery);
;(function($, undefined) {
    var kendo = window.kendo,
        Widget = kendo.ui.Widget,
        INVALIDMSG = "k-invalid-msg",
        INVALIDINPUT = "k-invalid",
        emailRegExp = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i,
        urlRegExp = /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i,
        INPUTSELECTOR = ":input:not(:button,[type=submit],[type=reset])",
        NUMBERINPUTSELECTOR = "[type=number],[type=range]",
        BLUR = "blur",
        NAME = "name",
        FORM = "form",
        NOVALIDATE = "novalidate",
        proxy = $.proxy,
        patternMatcher = function(value, pattern) {
            if (typeof pattern === "string") {
                pattern = new RegExp('^(?:' + pattern + ')$');
            }
            return pattern.test(value);
        },
        matcher = function(input, selector, pattern) {
            var value = input.val();

            if (input.filter(selector).length && value !== "") {
                return patternMatcher(value, pattern);
            }
            return true;
        },
        hasAttribute = function(input, name) {
            if (input.length)  {
                return input[0].attributes[name] !== undefined;
            }
            return false;
        },
        nameSpecialCharRegExp = /(\[|\]|\$|\.|\:|\+)/g;

    if (!kendo.ui.validator) {
        kendo.ui.validator = { rules: {}, messages: {} };
    }

    function resolveRules(element) {
        var resolvers = kendo.ui.validator.ruleResolvers || {},
            rules = {},
            name;

        for (name in resolvers) {
            $.extend(true, rules, resolvers[name].resolve(element));
        }
        return rules;
    }

    function decode(value) {
        return value.replace(/&amp/g, '&amp;')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');
    }

    /**
     *  @name kendo.Validator.Description
     *
     *  @section
     *  <p>
     *     Validator offers an easy way to do client-side form validation.
     *     Built around the HTML5 form validation attributes it supports variety of built-in validation rules, but also provides a convenient way for setting custom rules handling.
     *  </p>
     *  @exampleTitle <b>Validator</b> initialization to validate input elements inside a container
     *  @example
     *  <div id="myform">
     *   <input type="text" name="firstName" required />
     *   <input type="text" name="lastName" required />
     *   <button id="save" type="button">Save</button>
     *  </div>
     *
     *  <script>
     *   $(document).ready(function(){
     *       var validatable = $("#myform").kendoValidator().data("kendoValidator");
     *       $("#save").click(function() {
     *          if (validatable.validate()) {
     *              save();
     *          }
     *       });
     *   });
     *   </script>
     *  @section <h4>Validation Rules</h4>
     *
     *  @exampleTitle <strong>required</strong>- element should have a value
     *  @example
     *  <input type="text" name="firstName" required />
     *
     *  @exampleTitle <strong>pattern</strong>- constrains the value to match a specific regular expression
     *  @example
     *  <input type="text" name="twitter" pattern="https?://(?:www\.)?twitter\.com/.+i" />
     *
     *  @exampleTitle <strong>max/min</strong>- constrain the minimum and/or maximum numeric values that can be entered
     *  @example
     *  <input type="number" name="age" min="1" max="42" />
     *
     *  @exampleTitle <strong>step</strong>- when used in combination with the min and max attributes, constrains the granularity of values that can be entered
     *  @example
     *  <input type="number" name="age" min="1" max="100" step="2" />
     *
     *  @exampleTitle <strong>url</strong>- constrain the value to being a valid URL
     *  @example
     *  <input type="url" name="url" />
     *
     *  @exampleTitle <strong>email</strong>- constrain the value to being a valid email
     *  @example
     *  <input type="email" name="email" />
     *
     *  @section
     *  <p>Beside the built-in validation rules, KendoUI Validator also provides a convenient way for setting custom rules through its rules configuration option. </p>
     *
     *  @exampleTitle
     *  @example
     *  $("#myform").kendoValidator({
     *      rules: {
     *        custom: function(input) {
     *          // Only Tom will be a valid value for FirstName input
     *          return input.is("[name=firstname]") && input.val() === "Tom";
     *        }
     *      }
     * });
     *
     *  @section <h4>Validation Messages</h4>
     *  <p>There are several ways to control the messages which appears if validation fails:</p>
     *
     *  @exampleTitle Set the validation messages for all input elements, through configuration options
     *  @example
     *   $("#myform").kendoValidator({
     *      rules: {
     *          custom: function(input) {
     *                  //...
     *          }
     *      },
     *      messages: {
     *        // defines message for the 'custom' validation rule
     *        custom: "Please enter valid value for my custom rule",
     *        // overrides the built-in message for required rule
     *        required: "My custom required message",
     *        // overrides the built-in email rule message with a custom function which return the actual message
     *        email: function(input) {
     *          return getMessage(input);
     *        }
     *     }
     *  });
     *  @exampleTitle Use the title and validationMessage attributes to set per input element messages
     *  @example
     *     <input type="tel" pattern="\d{10}" validationMessage="Plase enter a ten digit phone number" />
     *
     *  @section <h4>Triggering validation</h4>
     *  <p>In order to trigger the element(s) validation, <strong>validate</strong> method should be used. It will return either <em>true</em> if validation succeeded or <em>false</em> in case of a failure. </p>
     *  <p>
     *  Note that if a HTML form element is set as validation container, the form submits will be automatically prevented if validation fails.
     *  </p>
     *  @section <h4>Initialize Kendo Validator with specific tooltip position</h4>
     *
     *  <p>
     *      Ideally Kendo Validator places its tooltips besides the validated input. However, if the input is later enhanced to a ComboBox, AutoComplete or other Kendo Widget, placing the
     *      tooltip beside the input may cover important information or break the widget rendering. In this case, you can specify where exactly do you want the tooltip to be placed by
     *      adding a span with data-for attribute set to the validated input name and a class .k-invalid-msg. Check the example below:
     *  </p>
     *
     *  @exampleTitle <b>Validator</b> initialization with specific tooltip placement (the tooltip will remain outside of the AutoComplete widget after enhancement)
     *  @example
     *  <div id="myform">
     *      <input type="text" id="name" name="name" required />
     *      <span class="k-invalid-msg" data-for="name"></span>
     *  </div>
     *
     *  <script>
     *      $("#name").kendoAutoComplete({
     *                     dataSource: data,
     *                     separator: ", "
     *                 });
     *
     *      $("#myform").kendoValidator();
     *  </script>
     */
    var Validator = Widget.extend(/** @lends kendo.Validator.prototype */{ /**
         * @constructs
         * @extends kendo.Widget
         * @param {Element} element DOM element
         * @param {Object} options Configuration options.
         * @option {Object} [rules] Set of validation rules. Those rules will extend the built-in ones.
         * _example
         * $("#myform").kendoValidator({
         *      rules: {
         *          custom: function(input) {
         *              return input.is("[name=firstname]") && input.val() === "Tom"; // Only Tom will be a valid value for FirstName input
         *          }
         *      }
         * });
         * @option {Object} [messages] Set of messages (either strings or functions) which will be shown when given validation rule fails.
         *  By setting already existing key the appropriate built-in message will be overridden.
         * _example
         * $("#myform").kendoValidator({
         *      rules: {
         *          custom: function(input) {
         *             //...
         *          }
         *      },
         *      messages: {
         *          custom: "Please enter valid value for my custom rule",// defines message for the 'custom' validation rule
         *          required: "My custom required message", // overrides the built-in message for required rule
         *          email: function(input) { // overrides the built-in email rule message with a custom function which return the actual message
         *              return getMessage(input);
         *          }
         *      }
         * });
         * @option {Boolean} [validateOnBlur] Determines if validation will be triggered when element loses focus. Default value is true.
         */
        init: function(element, options) {
            var that = this,
                resolved = resolveRules(element);

            options = options || {};

            options.rules = $.extend({}, kendo.ui.validator.rules, resolved.rules, options.rules);
            options.messages = $.extend({}, kendo.ui.validator.messages, resolved.messages, options.messages);

            Widget.fn.init.call(that, element, options);

            that._errorTemplate = kendo.template(that.options.errorTemplate);

            if (that.element.is(FORM)) {
                that.element.attr(NOVALIDATE, NOVALIDATE);
            }

            that._errors = {};
            that._attachEvents();
        },

        options: {
            name: "Validator",
            errorTemplate: '<span class="k-widget k-tooltip k-tooltip-validation">' +
                '<span class="k-icon k-warning"> </span> ${message}</span>',
            messages: {
                required: "{0} is required",
                pattern: "{0} is not valid",
                min: "{0} should be greater than or equal to {1}",
                max: "{0} should be smaller than or equal to {1}",
                step: "{0} is not valid",
                email: "{0} is not valid email",
                url: "{0} is not valid URL",
                date: "{0} is not valid date"
            },
            rules: {
                required: function(input) {
                    var checkbox = input.filter("[type=checkbox]").length && input.attr("checked") !== "checked",
                        value = input.val();

                    return !(hasAttribute(input, "required") && (value === "" || !value  || checkbox));
                },
                pattern: function(input) {
                    if (input.filter("[type=text],[type=email],[type=url],[type=tel],[type=search],[type=password]").filter("[pattern]").length && input.val() !== "") {
                        return patternMatcher(input.val(), input.attr("pattern"));
                    }
                    return true;
                },
                min: function(input) {
                    if (input.filter(NUMBERINPUTSELECTOR + ",[" + kendo.attr("type") + "=number]").filter("[min]").length && input.val() !== "") {
                        var min = parseFloat(input.attr("min")) || 0,
                            val = parseFloat(input.val());

                        return min <= val;
                    }
                    return true;
                },
                max: function(input) {
                    if (input.filter(NUMBERINPUTSELECTOR + ",[" + kendo.attr("type") + "=number]").filter("[max]").length && input.val() !== "") {
                        var max = parseFloat(input.attr("max")) || 0,
                            val = parseFloat(input.val());

                        return max >= val;
                    }
                    return true;
                },
                step: function(input) {
                    if (input.filter(NUMBERINPUTSELECTOR + ",[" + kendo.attr("type") + "=number]").filter("[step]").length && input.val() !== "") {
                        var min = parseFloat(input.attr("min")) || 0,
                            step = parseFloat(input.attr("step")) || 0,
                            val = parseFloat(input.val());

                        return (((val-min)*10)%(step*10)) / 100 === 0;
                    }
                    return true;
                },
                email: function(input) {
                    return matcher(input, "[type=email],[" + kendo.attr("type") + "=email]", emailRegExp);
                },
                url: function(input) {
                    return matcher(input, "[type=url],[" + kendo.attr("type") + "=url]", urlRegExp);
                },
                date: function(input) {
                    if (input.filter("[type^=date],[" + kendo.attr("type") + "=date]").length && input.val() !== "") {
                        return kendo.parseDate(input.val(), input.attr(kendo.attr("format"))) !== null;
                    }
                    return true;
                }
            },
            validateOnBlur: true
        },

        _submit: function(e) {
            if (!this.validate()) {
                e.stopPropagation();
                e.stopImmediatePropagation();
                e.preventDefault();
                return false;
            }
            return true;
        },

        _attachEvents: function() {
            var that = this;

            if (that.element.is(FORM)) {
                that.element.submit(proxy(that._submit, that));
            }

            if (that.options.validateOnBlur) {
                if (!that.element.is(INPUTSELECTOR)) {
                    that.element.delegate(INPUTSELECTOR, BLUR, function() {
                        that.validateInput($(this));
                    });
                } else {
                    that.element.bind(BLUR, function() {
                        that.validateInput(that.element);
                    });
                }
            }
        },

        /**
         * Validates the input element(s) against the declared validation rules.
         * @returns {Boolean} If all rules are passed successfully.
         * @example
         * // get a reference to the validatable form
         * var validatable = $("#myform").kendoValidator().data("kendoValidator");
         * // check validation on save button click
         * $("#save").click(function() {
         *     if (validatable.validate()) {
         *         save();
         *     }
         * });
         */
        validate: function() {
            var that = this,
                inputs,
                idx,
                invalid = false,
                length;

            that._errors = {};

            if (!that.element.is(INPUTSELECTOR)) {
                inputs = that.element.find(INPUTSELECTOR);

                for (idx = 0, length = inputs.length; idx < length; idx++) {
                    if (!that.validateInput(inputs.eq(idx))) {
                        invalid = true;
                    }
                }
                return !invalid;
            }
            return that.validateInput(that.element);
        },

        /**
         * Validates the input element against the declared validation rules.
         * @param {Element} input Input element to be validated.
         * @returns {Boolean} If all rules are passed successfully.
         */
        validateInput: function(input) {
            input = $(input);

            var that = this,
                template = that._errorTemplate,
                result = that._checkValidity(input),
                valid = result.valid,
                className = "." + INVALIDMSG,
                fieldName = (input.attr(NAME) || ""),
                lbl = that._findMessageContainer(fieldName).add(input.next(className)).hide(),
                messageText;

            if (!valid) {
                messageText = that._extractMessage(input, result.key);
                that._errors[fieldName] = messageText;
                var messageLabel = $(template({ message: decode(messageText) }));

                that._decorateMessageContainer(messageLabel, fieldName);

                if (!lbl.replaceWith(messageLabel).length) {
                    messageLabel.insertAfter(input);
                }
                messageLabel.show();
            }

            input.toggleClass(INVALIDINPUT, !valid);

            return valid;
        },

        _findMessageContainer: function(fieldName) {
            var locators = kendo.ui.validator.messageLocators,
                name,
                containers = this.element.find("." + INVALIDMSG + "[" + kendo.attr("for") +"=" + fieldName.replace(nameSpecialCharRegExp, "\\$1") + "]");

            for (name in locators) {
                containers = containers.add(locators[name].locate(this.element, fieldName));
            }

            return containers;
        },

        _decorateMessageContainer: function(container, fieldName) {
            var locators = kendo.ui.validator.messageLocators,
                name;

            container.addClass(INVALIDMSG).attr(kendo.attr("for"), fieldName || "");

            for (name in locators) {
                locators[name].decorate(container, fieldName);
            }
        },

        _extractMessage: function(input, ruleKey) {
            var that = this,
                customMessage = that.options.messages[ruleKey],
                fieldName = input.attr(NAME);

            customMessage = $.isFunction(customMessage) ? customMessage(input) : customMessage;

            return kendo.format(input.attr(kendo.attr(ruleKey + "-msg")) || input.attr("validationMessage") || input.attr("title") || customMessage || "", fieldName, input.attr(ruleKey));
        },

        _checkValidity: function(input) {
            var rules = this.options.rules,
                rule;

            for (rule in rules) {
                if (!rules[rule](input)) {
                    return { valid: false, key: rule };
                }
            }

            return { valid: true };
        },

        /**
         * Get the error messages if any.
         * @returns {Array} Messages for the failed validation rules.
         * @example
         * // get a reference to the validatable form
         * var validatable = $("#myform").kendoValidator().data("kendoValidator");
         * $("#save").click(function() {
         *     if (validatable.validate() === false) {
         *         // get the errors and write them out to the "errors" html container
         *         var errors = validatable.errors();
         *         $(errors).each(function() {
         *             $("#errors").html(this);
         *         });
         *     }
         * });
         */
        errors: function() {
            var results = [],
                errors = this._errors,
                error;

            for (error in errors) {
                results.push(errors[error]);
            }
            return results;
        }
    });

    kendo.ui.plugin(Validator);
})(jQuery);
(function($, undefined) {
    var kendo = window.kendo,
        location = window.location,
        history = window.history,
        _checkUrlInterval = 50,
        hashStrip = /^#*/,
        documentMode = window.document.documentMode,
        oldIE = $.browser.msie && (!documentMode || documentMode <= 8),
        hashChangeSupported = ("onhashchange" in window) && !oldIE,
        document = window.document;

    var History = kendo.Observable.extend({

        start: function(options) {
            options = options || {};

            var that = this;

            that._pushStateRequested = !!options.pushState;
            that._pushState = that._pushStateRequested && that._pushStateSupported();
            that.root = options.root || "/";
            that._interval = 0;

            this.bind(["change", "ready"], options);
            if (that._normalizeUrl()) {
                return true;
            }

            that.current = that._currentLocation();
            that._listenToLocationChange();
            that.trigger("ready", {url: that.current});
        },

        stop: function() {
            $(window).unbind(".kendo");
            this.unbind("change");
            this.unbind("ready");
            clearInterval(this._interval);
        },

        _normalizeUrl: function() {
            var that = this,
                pushStateUrl,
                atRoot = that.root == location.pathname,
                pushStateUrlNeedsTransform = that._pushStateRequested && !that._pushStateSupported() && !atRoot,
                hashUrlNeedsTransform = that._pushState && atRoot && location.hash;

            if (pushStateUrlNeedsTransform) {
                location.replace(that.root + '#' + that._stripRoot(location.pathname));
                return true;
            } else if (hashUrlNeedsTransform) {
                pushStateUrl = that._makePushStateUrl(location.hash.replace(hashStrip, ''));
                history.replaceState({}, document.title, pushStateUrl);
                return false;
            }
            return false;
        },

        _listenToLocationChange: function() {
            var that = this, _checkUrlProxy = $.proxy(that._checkUrl, that);

            if (this._pushState) {
                $(window).bind("popstate.kendo", _checkUrlProxy);
            } else if (hashChangeSupported) {
                $(window).bind("hashchange.kendo", _checkUrlProxy);
            } else {
                that._interval = setInterval(_checkUrlProxy, _checkUrlInterval);
            }
        },

        _pushStateSupported: function() {
            return window.history && window.history.pushState;
        },

        _checkUrl: function(e) {
            var that = this, current = that._currentLocation();

            if (current != that.current) {
                that.navigate(current);
            }
        },

        _stripRoot: function(url) {
            var that = this;

            if (url.indexOf(that.root) === 0) {
                return ('/' + url.substr(that.root.length)).replace(/\/\//g, '/');
            } else {
                return url;
            }
        },


        _makePushStateUrl: function(address) {
            var that = this;

            if (address.indexOf(that.root) !== 0) {
                address = (that.root + address).replace(/\/\//g, '/');
            }

            return location.protocol + '//' + location.host + address;
        },

        _currentLocation: function() {
            var that = this, current;

            if (that._pushState) {
                current = location.pathname;

                if (location.search) {
                    current += location.search;
                }

                return that._stripRoot(current);
            } else {
                return location.hash.replace(hashStrip, '');
            }
        },

        change: function(callback) {
            this.bind('change', callback);
        },

        navigate: function(to, silent) {
            var that = this;

            if (to === '#:back') {
                history.back();
                return;
            }

            to = to.replace(hashStrip, '');

            if (that.current === to || that.current === decodeURIComponent(to)) {
                return;
            }

            if (that._pushState) {
                history.pushState({}, document.title, that._makePushStateUrl(to));
                that.current = to;
            } else {
                location.hash = that.current = to;
            }

            if (!silent) {
                that.trigger("change", {url: that.current});
            }
        }
    });

    kendo.history = new History();
})(jQuery);
(function ($, undefined) {
    var kendo = window.kendo,
        support = kendo.support,
        pointers = support.pointers,
        document = window.document,
        SURFACE = $(document.documentElement),
        Class = kendo.Class,
        Widget = kendo.ui.Widget,
        Observable = kendo.Observable,
        proxy = $.proxy,
        now = $.now,
        extend = $.extend,
        getOffset = kendo.getOffset,
        draggables = {},
        dropTargets = {},
        lastDropTarget,
        invalidZeroEvents = support.mobileOS && support.mobileOS.android,
        START_EVENTS = "mousedown",
        MOVE_EVENTS = "mousemove",
        END_EVENTS = "mouseup mouseleave",
        KEYUP = "keyup",
        CHANGE = "change",

        // Draggable events
        DRAGSTART = "dragstart",
        DRAG = "drag",
        DRAGEND = "dragend",
        DRAGCANCEL = "dragcancel",

        // DropTarget events
        DRAGENTER = "dragenter",
        DRAGLEAVE = "dragleave",
        DROP = "drop",

        // Drag events
        START = "start",
        MOVE = "move",
        END = "end",
        CANCEL = "cancel",
        TAP = "tap";

    if (support.touch) {
        START_EVENTS = "touchstart";
        MOVE_EVENTS = "touchmove";
        END_EVENTS = "touchend touchcancel";
    }

    if(pointers) {
        START_EVENTS = "MSPointerDown";
        MOVE_EVENTS = "MSPointerMove";
        END_EVENTS = "MSPointerUp MSPointerCancel";
    }

    function contains(parent, child) {
        try {
            return $.contains(parent, child) || parent == child;
        } catch (e) {
            return false;
        }
    }

    function elementUnderCursor(e) {
        return document.elementFromPoint(e.x.client, e.y.client);
    }

    function numericCssPropery(element, property) {
        return parseInt(element.css(property), 10) || 0;
    }

    function within(value, range) {
        return Math.min(Math.max(value, range.min), range.max);
    }

    function containerBoundaries(container, element) {
        var offset = container.offset(),
            minX = offset.left + numericCssPropery(container, "borderLeftWidth") + numericCssPropery(container, "paddingLeft"),
            minY = offset.top + numericCssPropery(container, "borderTopWidth") + numericCssPropery(container, "paddingTop"),
            maxX = minX + container.width() - element.outerWidth(true),
            maxY = minY + container.height() - element.outerHeight(true);

        return {
            x: { min: minX, max: maxX },
            y: { min: minY, max: maxY }
        };
    }

    function addNS(events, ns) {
        return events.replace(/ /g, ns + " ");
    }

    function preventTrigger(e) {
        e.preventDefault();

        var target = $(e.target),   // Determine the correct parent to receive the event and bubble.
            parent = target.closest(".k-widget").parent();

        if (!parent[0]) {
            parent = target.parent();
        }

        parent.trigger(e.type);
    }

    /**
     * @name kendo.DragAxis.Description
     *
     * @section <h4>DragAxis</h4>
     * The DragAxis is used internally by the kendo.Drag component to store and calculate event data.
     * The Drag component contains two DragAxis instances: <code>x</code> for the horizontal coordinates, and <code>y</code> for the vertical.
     * The two DragAxis instances are available in each Drag event parameter.
     * @exampleTitle Access DragAxis information in Drag start event
     * @example
     * new kendo.Drag($("#foo"), {
     *  start: function(e) {
     *      console.log(x); // Horizontal axis
     *      console.log(y); // Vertical axis
     *  }
     * });
     *
     * @section Each axis instance contains the following fields:
     * <ul>
     *   <li><b>location</b> - the offset of the mouse/touch relative to the entire document (pageX/Y);</li>
     *   <li><b>startLocation</b> - the offset of the mouse/touch relative to the document when the drag started;</li>
     *   <li><b>client</b> - the offset of the mouse/touch relative to the viewport (clientX/Y);</li>
     *   <li><b>delta</b> - the change from the previous event location</li>
     *   <li><b>velocity</b> - the pixels per millisecond speed of the current move.</li>
     * </ul>
     */
    var DragAxis = Class.extend(/** @lends kendo.DragAxis.prototype */{
        /**
         * @constructs
         */
        init: function(axis) {
            this.axis = axis;
        },

        start: function(location, timeStamp) {
            var that = this,
                offset = location["page" + that.axis];

            that.startLocation = that.location = offset;
            that.client = location["client" + that.axis];
            that.velocity = that.delta = 0;
            that.timeStamp = timeStamp;
        },

        move: function(location, timeStamp) {
            var that = this,
                offset = location["page" + that.axis];

            if (!offset && invalidZeroEvents) {
                return;
            }

            that.delta = offset - that.location;
            that.location = offset;
            that.client = location["client" + that.axis];
            that.initialDelta = offset - that.startLocation;
            that.velocity = that.delta / (timeStamp - that.timeStamp);
            that.timeStamp = timeStamp;
        }
    });

    /**
     * @name kendo.Drag.Description
     * @section <h4>Drag</h4> The kendo Drag component provides a cross-browser, touch-friendly way to handle mouse and touch drag events.
     * @exampleTitle <b>Drag</b> initialization
     * @example
     * var drag = new kendo.Drag($("#draggable"));
     */
    var Drag = Observable.extend(/** @lends kendo.Drag.prototype */{
        /**
         * @constructs
         * @extends kendo.Observable
         * @param {Element} element the DOM element from which the drag event starts.
         * @param {Object} options Configuration options.
         * @option {Number} [threshold] <0> The minimum distance the mouse/touch should move before the event is triggered.
         * @option {Boolean} [global] <false> If set to true, the drag event will be tracked beyond the element boundaries.
         * @option {Element} [surface]  If set, the drag event will be tracked for the surface boundaries. By default, leaving the element boundaries will end the drag.
         * @option {Boolean} [allowSelection] <false> If set to true, the mousedown and selectstart events will not be prevented.
         * @option {Boolean} [stopPropagation] <false> If set to true, the mousedown event propagation will be stopped, disabling
         * drag capturing at parent elements.
         * If set to false, dragging outside of the element boundaries will trigger the <code>end</code> event.
         * @option {Selector} [filter] If passed, the filter limits the child elements that will trigger the event sequence.
         */
        init: function(element, options) {
            var that = this,
                eventMap = {},
                filter,
                preventIfMoving,
                ns = "." + kendo.guid();

            options = options || {};
            filter = that.filter = options.filter;
            that.threshold = options.threshold || 0;

            element = $(element);
            Observable.fn.init.call(that);

            eventMap[addNS(MOVE_EVENTS, ns)] = proxy(that._move, that);
            eventMap[addNS(END_EVENTS, ns)] = proxy(that._end, that);

            extend(that, {
                x: new DragAxis("X"),
                y: new DragAxis("Y"),
                element: element,
                surface: options.global ? SURFACE : options.surface || element,
                stopPropagation: options.stopPropagation,
                pressed: false,
                eventMap: eventMap,
                ns: ns
            });

            element
                .on(START_EVENTS, filter, proxy(that._start, that))
                .on("dragstart", filter, kendo.preventDefault);

            if (pointers) {
                element.css("-ms-touch-action", "pinch-zoom double-tap-zoom");
            }

            if (!options.allowSelection) {
                var args = ["mousedown selectstart", filter, preventTrigger];

                if (filter instanceof $) {
                    args.splice(2, 0, null);
                }

                element.on.apply(element, args);
            }

            if (support.eventCapture) {
                preventIfMoving = function(e) {
                    if (that.moved) {
                        e.preventDefault();
                    }
                };

                that.surface[0].addEventListener(support.mouseup, preventIfMoving, true);
            }

            that.bind([
            /**
             * Fires when the user presses and releases the element without any movement or with a movement below the <code>threshold</code> specified.
             * @name kendo.Drag#tap
             * @event
             * @param {Event} e
             * @param {DragAxis} e.x Reference to the horizontal drag axis instance.
             * @param {DragAxis} e.y Reference to the vertical drag axis instance.
             * @param {jQueryEvent} e.event Reference to the jQuery event object.
             * @param {Element} e.target Reference to the DOM element from which the Drag started.
             * It is different from the element only if <code>filter</code> option is specified.
             */
            TAP,
            /**
             * Fires when the user starts dragging the element.
             * @name kendo.Drag#start
             * @event
             * @param {Event} e
             * @param {DragAxis} e.x Reference to the horizontal drag axis instance.
             * @param {DragAxis} e.y Reference to the vertical drag axis instance.
             * @param {jQueryEvent} e.event Reference to the jQuery event object.
             * @param {Element} e.target Reference to the DOM element from which the Drag started.
             * It is different from the element only if <code>filter</code> option is specified.
             */
            START,
            /**
             * Fires while dragging.
             * @name kendo.Drag#move
             * @event
             * @param {Event} e
             * @param {DragAxis} e.x Reference to the horizontal drag axis instance.
             * @param {DragAxis} e.y Reference to the vertical drag axis instance.
             * @param {jQueryEvent} e.event Reference to the jQuery event object.
             * @param {Element} e.target Reference to the DOM element from which the Drag started.
             * It is different from the element only if <code>filter</code> option is specified.
             */
            MOVE,
            /**
             * Fires when the drag ends.
             * @name kendo.Drag#end
             * @event
             * @param {Event} e
             * @param {DragAxis} e.x Reference to the horizontal drag axis instance.
             * @param {DragAxis} e.y Reference to the vertical drag axis instance.
             * @param {jQueryEvent} e.event Reference to the jQuery event object.
             * @param {Element} e.target Reference to the DOM element from which the Drag started.
             * It is different from the element only if <code>filter</code> option is specified.
             */
            END,
            /**
             * Fires when the drag is canceled. This  when the <code>cancel</code> method is called.
             * @name kendo.Drag#cancel
             * @event
             * @param {Event} e
             * @param {DragAxis} e.x Reference to the horizontal drag axis instance.
             * @param {DragAxis} e.y Reference to the vertical drag axis instance.
             * @param {jQueryEvent} e.event Reference to the jQuery event object.
             * @param {Element} e.target Reference to the DOM element from which the Drag started.
             * It is different from the element only if <code>filter</code> option is specified.
             */
            CANCEL], options);
        },

        /**
         * Capture the current drag, so that Drag listeners bound to parent elements will not trigger.
         * This method will not have any effect if the current drag instance is instantiated with the <code>global</code> option set to true.
         */
        capture: function() {
            Drag.captured = true;
        },

        /**
         * Discard the current drag. Calling the <code>cancel</code> method will trigger the <code>cancel</code> event.
         * The correct moment to call this method would be in the <code>start</code> event handler.
         * @exampleTitle Cancel the drag event sequence
         * @example
         * new kendo.Drag($("#foo"), {
         *  start: function(e) {
         *      e.cancel();
         *  }
         * });
         */
        cancel: function() {
            this._cancel();
            this.trigger(CANCEL);
        },

        skip: function() {
            this._cancel();
        },

        _cancel: function() {
            var that = this;
            that.moved = that.pressed = false;
            that.surface.off(that.ns);
        },

        _start: function(e) {
            var that = this,
                filter = that.filter,
                originalEvent = e.originalEvent,
                touch,
                location = e;

            if (that.pressed) { return; }

            if (filter) {
                that.target = $(e.target).is(filter) ? $(e.target) : $(e.target).closest(filter);
            } else {
                that.target = that.element;
            }

            if (!that.target.length) {
                return;
            }

            that.currentTarget = e.currentTarget;

            if (that.stopPropagation) {
                e.stopPropagation();
            }

            that.pressed = true;
            that.moved = false;
            that.startTime = null;

            if (support.touch) {
                touch = originalEvent.changedTouches[0];
                that.touchID = touch.identifier;
                location = touch;
            }

            if (pointers) {
                that.touchID = originalEvent.pointerId;
                location = originalEvent;
            }

            that._perAxis(START, location, now());
            that.surface.off(that.eventMap).on(that.eventMap);
            Drag.captured = false;
        },

        _move: function(e) {
            var that = this,
                xDelta,
                yDelta,
                delta;

            if (!that.pressed) { return; }

            that._withEvent(e, function(location) {

                that._perAxis(MOVE, location, now());

                if (!that.moved) {
                    xDelta = that.x.initialDelta;
                    yDelta = that.y.initialDelta;

                    delta = Math.sqrt(xDelta * xDelta + yDelta * yDelta);

                    if (delta <= that.threshold) {
                        return;
                    }

                    if (!Drag.captured) {
                        that.startTime = now();
                        that._trigger(START, e);
                        that.moved = true;
                    } else {
                        return that._cancel();
                    }
                }

                // Event handlers may cancel the swipe in the START event handler, hence the double check for pressed.
                if (that.pressed) {
                    that._trigger(MOVE, e);
                }
            });
        },

        _end: function(e) {
            var that = this;

            if (!that.pressed) { return; }

            that._withEvent(e, function() {
                if (that.moved) {
                    that.endTime = now();
                    that._trigger(END, e);
                    that.moved = false;
                } else {
                    that._trigger(TAP, e);
                }

                that._cancel();
            });
        },

        _perAxis: function(method, location, timeStamp) {
            this.x[method](location, timeStamp);
            this.y[method](location, timeStamp);
        },

        _trigger: function(name, e) {
            var data = {
                x: this.x,
                y: this.y,
                target: this.target,
                event: e
            };

            if(this.trigger(name, data)) {
                e.preventDefault();
            }
        },

        _withEvent: function(e, callback) {
            var that = this,
                touchID = that.touchID,
                originalEvent = e.originalEvent,
                touches,
                idx;

            if (support.touch) {
                touches = originalEvent.changedTouches;
                idx = touches.length;

                while (idx) {
                    idx --;
                    if (touches[idx].identifier === touchID) {
                        return callback(touches[idx]);
                    }
                }
            }
            else if (pointers) {
                if (touchID === originalEvent.pointerId) {
                    return callback(originalEvent);
                }
            } else {
                return callback(e);
            }
        }
    });

    var Tap = Observable.extend({
        init: function(element, options) {
            var that = this,
                domElement = element[0];

            that.capture = false;
            domElement.addEventListener(START_EVENTS, proxy(that._press, that), true);
            $.each(END_EVENTS.split(" "), function() {
                domElement.addEventListener(this, proxy(that._release, that), true);
            });

            Observable.fn.init.call(that);

            that.bind(["press", "release"], options || {});
        },

        _press: function(e) {
            var that = this;
            that.trigger("press");
            if (that.capture) {
                e.preventDefault();
            }
        },

        _release: function(e) {
            var that = this;
            that.trigger("release");

            if (that.capture) {
                e.preventDefault();
                that.cancelCapture();
            }
        },

        captureNext: function() {
            this.capture = true;
        },

        cancelCapture: function() {
            this.capture = false;
        }
    });

    var PaneDimension = Observable.extend({
        init: function(options) {
            var that = this;
            Observable.fn.init.call(that);

            $.extend(that, options);

            that.max = 0;

            if (that.horizontal) {
                that.measure = "width";
                that.scrollSize = "scrollWidth";
                that.axis = "x";
            } else {
                that.measure = "height";
                that.scrollSize = "scrollHeight";
                that.axis = "y";
            }
        },

        outOfBounds: function(offset) {
            return  offset > this.max || offset < this.min;
        },

        present: function() {
            return this.max - this.min;
        },

        getSize: function() {
            return this.container[this.measure]();
        },

        getTotal: function() {
            return this.element[0][this.scrollSize];
        },

        update: function(silent) {
            var that = this;

            that.size = that.getSize();
            that.total = that.getTotal();
            that.min = Math.min(that.max, that.size - that.total);
            if (!silent) {
                that.trigger(CHANGE, that);
            }
        }
    });

    var PaneDimensions = Observable.extend({
        init: function(options) {
            var that = this,
                refresh = proxy(that.refresh, that);

            Observable.fn.init.call(that);

            that.x = new PaneDimension(extend({horizontal: true}, options));
            that.y = new PaneDimension(extend({horizontal: false}, options));

            that.bind(CHANGE, options);

            kendo.onResize(refresh);
        },

        present: function() {
            return this.x.present() || this.y.present();
        },

        refresh: function() {
            this.x.update();
            this.y.update();
            this.trigger(CHANGE);
        }
    });

    var PaneAxis = Observable.extend({
        init: function(options) {
            var that = this;
            extend(that, options);
            Observable.fn.init.call(that);
        },

        dragMove: function(delta) {
            var that = this,
                dimension = that.dimension,
                axis = that.axis,
                movable = that.movable,
                position = movable[axis] + delta;

            if (!dimension.present()) {
                return;
            }

            if ((position < dimension.min && delta < 0) || (position > dimension.max && delta > 0)) {
                delta *= that.resistance;
            }

            movable.translateAxis(axis, delta);
            that.trigger(CHANGE, that);
        }
    });

    var Pane = Class.extend({
        init: function(options) {
            var that = this,
                x,
                y,
                resistance;

            extend(that, {elastic: true}, options);

            resistance = that.elastic ? 0.5 : 0;

            that.x = x = new PaneAxis({
                axis: "x",
                dimension: that.dimensions.x,
                resistance: resistance,
                movable: that.movable
            });

            that.y = y = new PaneAxis({
                axis: "y",
                dimension: that.dimensions.y,
                resistance: resistance,
                movable: that.movable
            });

            that.drag.bind(["move", "end"], {
                move: function(e) {
                    if (x.dimension.present() || y.dimension.present()) {
                        x.dragMove(e.x.delta);
                        y.dragMove(e.y.delta);
                        e.preventDefault();
                    } else {
                        that.drag.skip();
                    }
                },

                end: function(e) {
                    e.preventDefault();
                }
            });
        }
    });

    var TRANSFORM_STYLE = support.transitions.prefix + "Transform",
        round = Math.round,
        translate;

    if (support.hasHW3D) {
        translate = function(x, y) {
            return "translate3d(" + round(x) + "px," + round(y) +"px,0)";
        };
    } else {
        translate = function(x, y) {
            return "translate(" + round(x) + "px," + round(y) +"px)";
        };
    }

    var Movable = Observable.extend({
        init: function(element) {
            var that = this;

            Observable.fn.init.call(that);

            that.element = $(element);
            that.x = 0;
            that.y = 0;
            that._saveCoordinates(translate(that.x, that.y));
        },

        translateAxis: function(axis, by) {
            this[axis] += by;
            this.refresh();
        },

        translate: function(coordinates) {
            this.x += coordinates.x;
            this.y += coordinates.y;
            this.refresh();
        },

        moveAxis: function(axis, value) {
            this[axis] = value;
            this.refresh();
        },

        moveTo: function(coordinates) {
            extend(this, coordinates);
            this.refresh();
        },

        refresh: function() {
            var that = this,
                newCoordinates = translate(that.x, that.y);

            if (newCoordinates != that.coordinates) {
                that.element[0].style[TRANSFORM_STYLE] = newCoordinates;
                that._saveCoordinates(newCoordinates);
                that.trigger(CHANGE);
            }
        },

        _saveCoordinates: function(coordinates) {
            this.coordinates = coordinates;
        }
    });

    var DropTarget = Widget.extend(/** @lends kendo.ui.DropTarget.prototype */ {
        /**
         * @constructs
         * @extends kendo.ui.Widget
         * @param {Element} element DOM element
         * @param {Object} options Configuration options.
         * @option {String} [group] <"default"> Used to group sets of draggable and drop targets. A draggable with the same group value as a drop target will be accepted by the drop target.
         */
        init: function(element, options) {
            var that = this;

            Widget.fn.init.call(that, element, options);

            var group = that.options.group;

            if (!(group in dropTargets)) {
                dropTargets[group] = [ that ];
            } else {
                dropTargets[group].push( that );
            }
        },

        events: [
            /**
             * Fires when draggable moves over the drop target.
             * @name kendo.ui.DropTarget#dragenter
             * @event
             * @param {Event} e
             * @param {jQuery} e.draggable Reference to the draggable that enters the drop target.
             */
            DRAGENTER,
            /**
             * Fires when draggable moves out of the drop target.
             * @name kendo.ui.DropTarget#dragleave
             * @event
             * @param {Event} e
             * @param {jQuery} e.draggable Reference to the draggable that leaves the drop target.
             */
            DRAGLEAVE,
            /**
             * Fires when draggable is dropped over the drop target.
             * @name kendo.ui.DropTarget#drop
             * @event
             * @param {Event} e
             * @param {jQuery} e.draggable Reference to the draggable that is dropped over the drop target.
             * @param {jQuery} e.draggable.currentTarget The element that the drag and drop operation started from.
             */
            DROP
        ],

        options: {
            name: "DropTarget",
            group: "default"
        },

        _trigger: function(eventName, e) {
            var that = this,
                draggable = draggables[that.options.group];

            if (draggable) {
                return that.trigger(eventName, extend({}, e.event, {
                           draggable: draggable
                       }));
            }
        },

        _over: function(e) {
            this._trigger(DRAGENTER, e);
        },

        _out: function(e) {
            this._trigger(DRAGLEAVE, e);
        },

        _drop: function(e) {
            var that = this,
                draggable = draggables[that.options.group];

            if (draggable) {
                draggable.dropped = !that._trigger(DROP, e);
            }
        }
    });

    /**
     * @name kendo.ui.Draggable.Description
     *
     * @section <h4>Draggable</h4>
     * Enable draggable functionality on any DOM element.
     *
     * @exampleTitle <b>Draggable</b> initialization
     * @example
     * var draggable = $("#draggable").kendoDraggable();
     *
     * @name kendo.ui.DropTarget.Description
     *
     * @section <h4>DropTarget</h4>
     * Enable any DOM element to be a target for draggable elements.
     *
     * @exampleTitle <b>DropTarget</b> initialization
     * @example
     * var dropTarget = $("#dropTarget").kendoDropTarget();
     */
    var Draggable = Widget.extend(/** @lends kendo.ui.Draggable.prototype */{
        /**
         * @constructs
         * @extends kendo.ui.Widget
         * @param {Element} element DOM element
         * @param {Object} options Configuration options.
         * @option {Number} [distance] <5> The required distance that the mouse should travel in order to initiate a drag.
         * @option {Selector} [filter] Selects child elements that are draggable if a widget is attached to a container.
         * @option {String} [group] <"default"> Used to group sets of draggable and drop targets. A draggable with the same group value as a drop target will be accepted by the drop target.
         * @option {String} [axis] <null> Constrains the hint movement to either the horizontal (x) or vertical (y) axis. Can be set to either "x" or "y".
         * @option {jQuery} [container] If set, the hint movement is constrained to the container boundaries.
         * @option {Object} [cursorOffset] <null> If set, specifies the offset of the hint relative to the mouse cursor/finger.
         * By default, the hint is initially positioned on top of the draggable source offset. The option accepts an object with two keys: <code>top</code> and <code>left</code>.
         * _exampleTitle Initialize Draggable with cursorOffset
         * _example
         * $("#draggable").kendoDraggable({cursorOffset: {top: 10, left: 10}});
         * @option {Function | jQuery} [hint] Provides a way for customization of the drag indicator. If a function is supplied, it receives one argument - the draggable element's jQuery object.
         * _example
         *  //hint as a function
         *  $("#draggable").kendoDraggable({
         *      hint: function(element) {
         *          return $("#draggable").clone();
         *          // same as
         *          //  return element.clone();
         *      }
         *  });
         *
         * //hint as jQuery object
         *  $("#draggable").kendoDraggable({
         *      hint: $("#draggableHint");
         *  });
         */
        init: function (element, options) {
            var that = this;

            Widget.fn.init.call(that, element, options);

            that.drag = new Drag(that.element, {
                global: true,
                stopPropagation: true,
                filter: that.options.filter,
                threshold: that.options.distance,
                start: proxy(that._start, that),
                move: proxy(that._drag, that),
                end: proxy(that._end, that),
                cancel: proxy(that._cancel, that)
            });

            that.destroy = proxy(that._destroy, that);
            that.captureEscape = function(e) {
                if (e.keyCode === kendo.keys.ESC) {
                    that._trigger(DRAGCANCEL, {event: e});
                    that.drag.cancel();
                }
            };
        },

        events: [
            /**
             * Fires when item drag starts.
             * @name kendo.ui.Draggable#dragstart
             * @event
             * @param {Event} e
             */
            DRAGSTART,
             /**
             * Fires while dragging.
             * @name kendo.ui.Draggable#drag
             * @event
             * @param {Event} e
             */
            DRAG,
             /**
             * Fires when item drag ends.
             * @name kendo.ui.Draggable#dragend
             * @event
             * @param {Event} e
             */
            DRAGEND,
             /**
             * Fires when item drag is canceled by pressing the Escape key.
             * @name kendo.ui.Draggable#dragcancel
             * @event
             * @param {Event} e
             */
            DRAGCANCEL
        ],

        options: {
            name: "Draggable",
            distance: 5,
            group: "default",
            cursorOffset: null,
            axis: null,
            container: null,
            dropped: false
        },

        _start: function(e) {
            var that = this,
                options = that.options,
                container = options.container,
                hint = options.hint;

            that.currentTarget = that.drag.target;
            that.currentTargetOffset = getOffset(that.currentTarget);

            if (hint) {
                that.hint = $.isFunction(hint) ? $(hint(that.currentTarget)) : hint;

                var offset = getOffset(that.currentTarget);
                that.hintOffset = offset;

                that.hint.css( {
                    position: "absolute",
                    zIndex: 20000, // the Window's z-index is 10000 and can be raised because of z-stacking
                    left: offset.left,
                    top: offset.top
                })
                .appendTo(document.body);
            }

            draggables[options.group] = that;

            that.dropped = false;

            if (container) {
                that.boundaries = containerBoundaries(container, that.hint);
            }

            if (that._trigger(DRAGSTART, e)) {
                that.drag.cancel();
                that.destroy();
            }

            $(document).on(KEYUP, that.captureEscape);
        },

        updateHint: function(e) {
            var that = this,
                coordinates,
                options = that.options,
                boundaries = that.boundaries,
                axis = options.axis,
                cursorOffset = that.options.cursorOffset;

            if (cursorOffset) {
               coordinates = { left: e.x.location + cursorOffset.left, top: e.y.location + cursorOffset.top };
            } else {
               that.hintOffset.left += e.x.delta;
               that.hintOffset.top += e.y.delta;
               coordinates = $.extend({}, that.hintOffset);
            }

            if (boundaries) {
                coordinates.top = within(coordinates.top, boundaries.y);
                coordinates.left = within(coordinates.left, boundaries.x);
            }

            if (axis === "x") {
                delete coordinates.top;
            } else if (axis === "y") {
                delete coordinates.left;
            }

            that.hint.css(coordinates);
        },

        _drag: function(e) {
            var that = this;

            e.preventDefault();

            that._withDropTarget(e, function(target) {
                if (!target) {
                    if (lastDropTarget) {
                        lastDropTarget._trigger(DRAGLEAVE, e);
                        lastDropTarget = null;
                    }
                    return;
                }

                if (lastDropTarget) {
                    if (target.element[0] === lastDropTarget.element[0]) {
                        return;
                    }

                    lastDropTarget._trigger(DRAGLEAVE, e);
                }

                target._trigger(DRAGENTER, e);
                lastDropTarget = target;
            });

            that._trigger(DRAG, e);

            if (that.hint) {
                that.updateHint(e);
            }
        },

        _end: function(e) {
            var that = this;

            that._withDropTarget(e, function(target) {
                if (target) {
                    target._drop(e);
                    lastDropTarget = null;
                }
            });

            that._trigger(DRAGEND, e);
            that._cancel(e.event);
        },

        _cancel: function(e) {
            var that = this;

            if (that.hint && !that.dropped) {
                that.hint.animate(that.currentTargetOffset, "fast", that.destroy);
            } else {
                that.destroy();
            }
        },

        _trigger: function(eventName, e) {
            var that = this;

            return that.trigger(
            eventName, extend(
            {},
            e.event,
            {
                x: e.x,
                y: e.y,
                currentTarget: that.currentTarget
            }));
        },

        _withDropTarget: function(e, callback) {
            var that = this,
                target,
                theTarget,
                result,
                options = that.options,
                targets = dropTargets[options.group],
                i = 0,
                length = targets && targets.length;

            if (length) {

                target = elementUnderCursor(e);

                if (that.hint && contains(that.hint, target)) {
                    that.hint.hide();
                    target = elementUnderCursor(e);
                    that.hint.show();
                }

                outer:
                while (target) {
                    for (i = 0; i < length; i ++) {
                        theTarget = targets[i];
                        if (theTarget.element[0] === target) {
                            result = theTarget;
                            break outer;
                        }
                    }

                    target = target.parentNode;
                }

                callback(result);
            }
        },

        _destroy: function() {
            var that = this;

            if (that.hint) {
                that.hint.remove();
            }

            delete draggables[that.options.group];

            that.trigger("destroy");
            $(document).off(KEYUP, that.captureEscape);
        }
    });

    kendo.ui.plugin(DropTarget);
    kendo.ui.plugin(Draggable);
    kendo.Drag = Drag;
    kendo.Tap = Tap;
    kendo.containerBoundaries = containerBoundaries;

    extend(kendo.ui, {
        Pane: Pane,
        PaneDimensions: PaneDimensions,
        Movable: Movable
    });

 })(jQuery);
(function($, undefined) {
    var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget,
        support = kendo.support,
        touch = support.touch,
        getOffset = kendo.getOffset,
        appendingToBodyTriggersResize = $.browser.msie && $.browser.version < 9,
        OPEN = "open",
        CLOSE = "close",
        DEACTIVATE = "deactivate",
        ACTIVATE = "activate",
        CENTER = "center",
        LEFT = "left",
        RIGHT = "right",
        TOP = "top",
        BOTTOM = "bottom",
        ABSOLUTE = "absolute",
        HIDDEN = "hidden",
        BODY = "body",
        LOCATION = "location",
        POSITION = "position",
        VISIBLE = "visible",
        FITTED = "fitted",
        EFFECTS = "effects",
        ACTIVE = "k-state-active",
        ACTIVEBORDER = "k-state-border",
        ACTIVECHILDREN = ".k-picker-wrap, .k-dropdown-wrap, .k-link",
        MOUSEDOWN = touch ? "touchstart" : "mousedown",
        DOCUMENT= $(document),
        WINDOW = $(window),
        DOCUMENT_ELEMENT = $(document.documentElement),
        RESIZE_SCROLL = "resize scroll",
        cssPrefix = support.transitions.css,
        TRANSFORM = cssPrefix + "transform",
        extend = $.extend,
        styles = ["font-family",
                   "font-size",
                   "font-stretch",
                   "font-style",
                   "font-weight",
                   "line-height"];

    function contains(container, target) {
        return container === target || $.contains(container, target);
    }

    var Popup = Widget.extend({
        init: function(element, options) {
            var that = this, parentPopup;

            Widget.fn.init.call(that, element, options);

            element = that.element;
            options = that.options;

            that.collisions = options.collision ? options.collision.split(" ") : [];

            if (that.collisions.length === 1) {
                that.collisions.push(that.collisions[0]);
            }

            parentPopup = $(that.options.anchor).closest(".k-popup,.k-group"); // When popup is in another popup, make it relative.
            options.appendTo = $($(options.appendTo)[0] || parentPopup[0] || BODY);

            that.element.hide()
                .addClass("k-popup k-group k-reset")
                .css({ position : ABSOLUTE })
                .appendTo(options.appendTo)
                .bind("mouseenter mouseleave", function(e) {
                    that._hovered = e.type === "mouseenter";
                });

            that.wrapper = $();

            if (options.animation === false) {
                options.animation = { open: { show: true, effects: {} }, close: { hide: true, effects: {} } };
            }

            extend(options.animation.open, {
                complete: function() {
                    that.wrapper.css({ overflow: VISIBLE }); // Forcing refresh causes flickering in mobile.
                    that.trigger(ACTIVATE);
                }
            });

            extend(options.animation.close, {
                complete: function() {
                    that.wrapper.hide();

                    var location = that.wrapper.data(LOCATION),
                        anchor = $(options.anchor),
                        direction, dirClass;

                    if (location) {
                        that.wrapper.css(location);
                    }

                    if (options.anchor != BODY) {
                        direction = anchor.hasClass(ACTIVEBORDER + "-down") ? "down" : "up";
                        dirClass = ACTIVEBORDER + "-" + direction;

                        anchor
                            .removeClass(dirClass)
                            .children(ACTIVECHILDREN)
                            .removeClass(ACTIVE)
                            .removeClass(dirClass);

                        element.removeClass(ACTIVEBORDER + "-" + kendo.directions[direction].reverse);
                    }

                    that._closing = false;
                    that.trigger(DEACTIVATE);
                }
            });

            that._mousedownProxy = function(e) {
                that._mousedown(e);
            };

            that._currentWidth = DOCUMENT.width();

            that._resizeProxy = function(e) {
                that._resize(e);
            };

            if (options.toggleTarget) {
                $(options.toggleTarget).bind(options.toggleEvent, $.proxy(that.toggle, that));
            }
        },

        events: [
            OPEN,
            ACTIVATE,
            CLOSE,
            DEACTIVATE
        ],

        options: {
            name: "Popup",
            toggleEvent: "click",
            origin: BOTTOM + " " + LEFT,
            position: TOP + " " + LEFT,
            anchor: BODY,
            collision: "flip fit",
            viewport: window,
            animation: {
                open: {
                    effects: "slideIn:down",
                    transition: true,
                    duration: 200,
                    show: true
                },
                close: { // if close animation effects are defined, they will be used instead of open.reverse
                    duration: 100,
                    show: false,
                    hide: true
                }
            }
        },

        open: function(x, y) {
            var that = this,
                fixed = { isFixed: !isNaN(parseInt(y,10)), x: x, y: y },
                element = that.element,
                options = that.options,
                direction = "down",
                animation, wrapper,
                anchor = $(options.anchor),
                style,
                idx;

            if (!that.visible()) {
                for (idx = 0; idx < styles.length; idx++) {
                    style = styles[idx];
                    element.css(style, anchor.css(style));
                }

                if (element.data("animating") || that.trigger(OPEN)) {
                    return;
                }

                DOCUMENT_ELEMENT.unbind(MOUSEDOWN, that._mousedownProxy)
                                .bind(MOUSEDOWN, that._mousedownProxy);
                if (!touch) {
                    WINDOW.unbind(RESIZE_SCROLL, that._resizeProxy)
                          .bind(RESIZE_SCROLL, that._resizeProxy);
                }

                that.wrapper = wrapper = kendo.wrap(element)
                                        .css({
                                            overflow: HIDDEN,
                                            display: "block",
                                            position: ABSOLUTE
                                        });

                if (support.mobileOS.android) {
                    wrapper.add(anchor).css(TRANSFORM, "translatez(0)"); // Android is VERY slow otherwise. Should be tested in other droids as well since it may cause blur.
                }

                wrapper.css(POSITION);

                if (options.appendTo == BODY) {
                    wrapper.css(TOP, "-10000px");
                }

                animation = extend(true, {}, options.animation.open);
                that.flipped = that._position(fixed);
                animation.effects = kendo.parseEffects(animation.effects, that.flipped);

                direction = animation.effects.slideIn ? animation.effects.slideIn.direction : direction;

                if (options.anchor != BODY) {
                    var dirClass = ACTIVEBORDER + "-" + direction;

                    element.addClass(ACTIVEBORDER + "-" + kendo.directions[direction].reverse);

                    anchor
                        .addClass(dirClass)
                        .children(ACTIVECHILDREN)
                        .addClass(ACTIVE)
                        .addClass(dirClass);
                }

                element.data(EFFECTS, animation.effects)
                       .kendoStop(true)
                       .kendoAnimate(animation);
            }
        },

        toggle: function() {
            var that = this;

            that[that.visible() ? CLOSE : OPEN]();
        },

        visible: function() {
            return this.element.is(":" + VISIBLE);
        },

        close: function() {
            var that = this,
                options = that.options,
                animation, openEffects, closeEffects;

            if (that.visible()) {
                if (that._closing || that.trigger(CLOSE)) {
                    return;
                }

                // Close all inclusive popups.
                that.element.find(".k-popup").each(function () {
                    var that = $(this),
                        popup = that.data("kendoPopup");

                    if (popup) {
                        popup.close();
                    }
                });

                DOCUMENT_ELEMENT.unbind(MOUSEDOWN, that._mousedownProxy);
                WINDOW.unbind(RESIZE_SCROLL, that._resizeProxy);

                animation = extend(true, {}, options.animation.close);
                openEffects = that.element.data(EFFECTS);
                closeEffects = animation.effects;

                that.wrapper = kendo.wrap(that.element).css({ overflow: HIDDEN });

                if (!closeEffects && !kendo.size(closeEffects) && openEffects && kendo.size(openEffects)) {
                    animation.effects = openEffects;
                    animation.reverse = true;
                }

                that._closing = true;

                that.element.kendoStop(true).kendoAnimate(animation);
            }
        },

        _resize: function(e) {
            var that = this;

            if (appendingToBodyTriggersResize) {
                var width = DOCUMENT.width();
                if (width == that._currentWidth) {
                    return;
                }
                that._currentWidth = width;
            }

            if (!that._hovered) {
                that.close();
            }
        },

        _mousedown: function(e) {
            var that = this,
                container = that.element[0],
                options = that.options,
                anchor = $(options.anchor)[0],
                toggleTarget = options.toggleTarget,
                target = kendo.eventTarget(e),
                popup = $(target).closest(".k-popup")[0];

            if (popup && popup !== that.element[0] ){
                return;
            }

            if (!contains(container, target) && !contains(anchor, target) && !(toggleTarget && contains($(toggleTarget)[0], target))) {
                that.close();
            }
        },

        _fit: function(position, size, viewPortSize) {
            var output = 0;

            if (position + size > viewPortSize) {
                output = viewPortSize - (position + size);
            }

            if (position < 0) {
                output = -position;
            }

            return output;
        },

        _flip: function(offset, size, anchorSize, viewPortSize, origin, position, boxSize) {
            var output = 0;
                boxSize = boxSize || size;

            if (position !== origin && position !== CENTER && origin !== CENTER) {
                if (offset + boxSize > viewPortSize) {
                    output += -(anchorSize + size);
                }

                if (offset + output < 0) {
                    output += anchorSize + size;
                }
            }
            return output;
        },

        _position: function(fixed) {
            var that = this,
                element = that.element,
                wrapper = that.wrapper,
                options = that.options,
                viewport = $(options.viewport),
                viewportOffset = $(viewport).offset(),
                anchor = $(options.anchor),
                origins = options.origin.toLowerCase().split(" "),
                positions = options.position.toLowerCase().split(" "),
                collisions = that.collisions,
                zoomLevel = support.zoomLevel(),
                zIndex = 10002;

            var siblingContainer = anchor.parents().filter(wrapper.siblings());

            if (siblingContainer[0]) {
                var parentZIndex = Number($(siblingContainer).css("zIndex"));
                if (parentZIndex) {
                    zIndex = parentZIndex + 1;
                }
            }

            wrapper.css("zIndex", zIndex);

            if (fixed && fixed.isFixed) {
                wrapper.css({ left: fixed.x, top: fixed.y });
            } else {
                wrapper.css(that._align(origins, positions));
            }

            var pos = getOffset(wrapper, POSITION),
                offset = getOffset(wrapper),
                anchorParent = anchor.offsetParent().parent(".k-animation-container"); // If the parent is positioned, get the current positions

            if (anchorParent.length && anchorParent.data(FITTED)) {
                pos = getOffset(wrapper, POSITION);
                offset = getOffset(wrapper);
            }

            if (viewport[0] === window) {
                offset.top -= (window.pageYOffset || document.documentElement.scrollTop || 0);
                offset.left -= (window.pageXOffset || document.documentElement.scrollLeft || 0);
            }
            else {
                offset.top -= viewportOffset.top;
                offset.left -= viewportOffset.left;
            }

            if (!that.wrapper.data(LOCATION)) { // Needed to reset the popup location after every closure - fixes the resize bugs.
                wrapper.data(LOCATION, extend({}, pos));
            }

            var offsets = extend({}, offset),
                location = extend({}, pos);

            if (collisions[0] === "fit") {
                location.top += that._fit(offsets.top, wrapper.outerHeight(), viewport.height() / zoomLevel);
            }

            if (collisions[1] === "fit") {
                location.left += that._fit(offsets.left, wrapper.outerWidth(), viewport.width() / zoomLevel);
            }

            if (location.left != pos.left || location.top != pos.top) {
                wrapper.data(FITTED, true);
            } else {
                wrapper.removeData(FITTED);
            }

            var flipPos = extend({}, location);

            if (collisions[0] === "flip") {
                location.top += that._flip(offsets.top, element.outerHeight(), anchor.outerHeight(), viewport.height() / zoomLevel, origins[0], positions[0], wrapper.outerHeight());
            }

            if (collisions[1] === "flip") {
                location.left += that._flip(offsets.left, element.outerWidth(), anchor.outerWidth(), viewport.width() / zoomLevel, origins[1], positions[1], wrapper.outerWidth());
            }

            wrapper.css(location);

            return (location.left != flipPos.left || location.top != flipPos.top);
        },

        _align: function(origin, position) {
            var that = this,
                element = that.wrapper,
                anchor = $(that.options.anchor),
                verticalOrigin = origin[0],
                horizontalOrigin = origin[1],
                verticalPosition = position[0],
                horizontalPosition = position[1],
                anchorOffset = getOffset(anchor),
                appendTo = $(that.options.appendTo),
                appendToOffset,
                width = element.outerWidth(),
                height = element.outerHeight(),
                anchorWidth = anchor.outerWidth(),
                anchorHeight = anchor.outerHeight(),
                top = anchorOffset.top,
                left = anchorOffset.left,
                round = Math.round;

            if (appendTo[0] != document.body) {
                appendToOffset = getOffset(appendTo);
                top -= appendToOffset.top;
                left -= appendToOffset.left;
            }


            if (verticalOrigin === BOTTOM) {
                top += anchorHeight;
            }

            if (verticalOrigin === CENTER) {
                top += round(anchorHeight / 2);
            }

            if (verticalPosition === BOTTOM) {
                top -= height;
            }

            if (verticalPosition === CENTER) {
                top -= round(height / 2);
            }

            if (horizontalOrigin === RIGHT) {
                left += anchorWidth;
            }

            if (horizontalOrigin === CENTER) {
                left += round(anchorWidth / 2);
            }

            if (horizontalPosition === RIGHT) {
                left -= width;
            }

            if (horizontalPosition === CENTER) {
                left -= round(width / 2);
            }

            return {
                top: top,
                left: left
            };
        }
    });

    ui.plugin(Popup);
})(jQuery);
(function($, undefined) {
    var kendo = window.kendo,
        abs = Math.abs;

    /**
     *
     * @name kendo.mobile.ui.Swipe.Description
     * @section
     * <p>The mobile swipe component handles user horizontal swiping events.</p>
     * <h3>Getting Started</h3>
     *
     * <p>To register a swipe event for a given jQuery selector, use the <code>kendoMobileSwipe</code> jQuery plugin method.</p>
     *
     * @exampleTitle swipe event handling
     * @example
     * <div>
     * <p>Foo</p>
     * </p>Bar</p>
     * </div>
     *
     * <script>
     *  $("p").kendoMobileSwipe(function(e) {
     *      console.log("You swiped" + e.target.text() );
     *  });
     * </script>
     *
     * @section
     * <p>The event handler accepts a parameter with the following fields:</p>
     * <table>
     *  <tr>
     *  <th align="left" valign="top">target</th>
     *  <td>The DOM element which was swiped</td>
     *  </tr>
     *  <tr>
     *  <th align="left" valign="top">direction</th>
     *  <td>The swipe direction. Can be either <code>left</code> or <code>right</code>.</td>
     *  </tr>
     *  <tr>
     *  <th align="left" valign="top">drag</th>
     *  <td>An instance of the kendo.Drag component, containing additional information about the drag event sequence, that generated the swipe.</td>
     *  </tr>
     * </table>
     *
     * <h3>Configuration</h3>
     *
     * <p>The swipe event criteria (minimum horizontal distance, maximum vertical deviation, timing, and swipe surface) can be configured by passing an additional parameter to the <code>kendoMobileSwipe</code> method. For more details, see the configuration section.</p>
     *
     * @exampleTitle Listen only for longer and faster swipe events
     * @example
     * <div>
     * <p>Foo</p>
     * </p>Bar</p>
     * </div>
     *
     * <script>
     *  $("p").kendoMobileSwipe(function(e) {
     *      console.log("You swiped" + e.target.text() );
     *  }, { minXDelta: 200, maxDuration: 100 });
     * </script>
     */

    var Swipe = kendo.Class.extend(/** @lends kendo.mobile.ui.Swipe.prototype */{
        /**
         * @constructs
         * @param {Element} element DOM element.
         * @param {Function} callback The callback to execute when the user swipes the element
         * @param {Object} options Configuration options.
         * @option {Number} [minXDelta] <30> The minimum horizontal distance in pixels the user should swipe before the event is triggered.
         * @option {Number} [maxYDelta] <10> The maximum vertical deviation in pixels of the swipe event. Swipe with higher deviation are discarded.
         * @option {Number} [maxDuration] <1000> The maximum amount of time in milliseconds the swipe event can last. Slower swipes are discarded.
         * @option {jQuery} [surface] By default, swipe events are tracked only within the element boundries. If a surface is specified, the swipe events are extended to the provided surface. This is useful if  the swipe targets are small (or narrow).
         */
        init: function(element, callback, options) {
            options = $.extend({
                minXDelta: 30,
                maxYDelta: 20,
                maxDuration: 1000
            }, options);

            new kendo.Drag(element, {
                surface: options.surface,

                start: function(e) {
                    if (abs(e.x.velocity) * 2 >= abs(e.y.velocity)) {
                        e.sender.capture();
                    }
                },

                move: function(e) {
                    var drag = e.sender,
                    duration = e.event.timeStamp - drag.startTime,
                    direction = e.x.initialDelta > 0 ? "right" : "left";

                    if (
                        abs(e.x.initialDelta) >= options.minXDelta &&
                        abs(e.y.initialDelta) < options.maxYDelta &&
                    duration < options.maxDuration)
                    {
                        callback({
                            direction: direction,
                            drag: drag,
                            target: $(drag.currentTarget)
                        });

                        drag.cancel();
                    }
                }
            });
        }
    });

    $.fn.kendoMobileSwipe = function(callback, options) {
        new Swipe(this, callback, options);
    };
})(jQuery);
(function($, undefined) {
    var kendo = window.kendo,
        mobile = kendo.mobile,
        ui = mobile.ui,
        SHOW = "show",
        HIDE = "hide",
        OPEN = "open",
        CLOSE = "close",
        WRAPPER = '<div class="km-popup-wrapper" />',
        ARROW = '<div class="km-popup-arrow" />',
        OVERLAY = '<div class="km-popup-overlay" />',
        DIRECTION_CLASSES = "km-up km-down km-left km-right",
        Widget = ui.Widget,
        DIRECTIONS = {
            "down": {
                origin: "bottom center",
                position: "top center"
            },
            "up": {
                origin: "top center",
                position: "bottom center"
            },
            "left": {
                origin: "center left",
                position: "center right",
                collision: "fit flip"
            },
            "right": {
                origin: "center right",
                position: "center left",
                collision: "fit flip"
            }
        },

        ANIMATION = {
            animation: {
                open: {
                    effects: "fade:in",
                    duration: 0
                },
                close: {
                    effects: "fade:out",
                    duration: 400
                }
            }
        },
        DIMENSIONS = {
            "horizontal": { offset: "top", size: "height" },
            "vertical": { offset: "left", size: "width" }
        },

        REVERSE = {
            "up": "down",
            "down": "up",
            "left": "right",
            "right": "left"
        };

    var Popup = Widget.extend({
        init: function(element, options) {
            var that = this,
                container = mobile.application.element,
                popupOptions = {
                    viewport: kendo.mobile.application.element,
                    open: function() {
                        that.overlay.show();
                    },

                    activate: $.proxy(that._activate, that),

                    deactivate: function() {
                        that.overlay.hide();
                        that.trigger(HIDE);
                    }
                },
                axis;

            Widget.fn.init.call(that, element, options);

            element = that.element;
            options = that.options;

            element.wrap(WRAPPER).addClass("km-popup").show();

            axis = that.options.direction.match(/left|right/) ? "horizontal" : "vertical";

            that.dimensions = DIMENSIONS[axis];

            that.wrapper = element.parent().css({
                width: options.width,
                height: options.height
            }).addClass("km-popup-wrapper km-" + options.direction).hide();

            that.arrow = $(ARROW).prependTo(that.wrapper).hide();

            that.overlay = $(OVERLAY).appendTo(container).hide();
            popupOptions.appendTo = that.overlay;

            that.popup = new kendo.ui.Popup(that.wrapper, $.extend(true, popupOptions, ANIMATION, DIRECTIONS[options.direction]));
        },

        options: {
            name: "Popup",
            width: 240,
            height: 320,
            direction: "down"
        },

        events: [
            SHOW,
            HIDE
        ],

        show: function(target) {
            var that = this,
                popup = that.popup;

            popup.options.anchor = $(target);
            popup.open();
        },

        hide: function() {
            this.popup.close();
        },

        _activate: function() {
            var that = this,
                direction = that.options.direction,
                dimensions = that.dimensions,
                offset = dimensions.offset,
                popup = that.popup,
                anchor = popup.options.anchor,
                anchorOffset = $(anchor).offset(),
                elementOffset = $(popup.element).offset(),
                cssClass = popup.flipped ? REVERSE[direction] : direction,
                offsetAmount = anchorOffset[offset] - elementOffset[offset] + ($(anchor)[dimensions.size]() / 2);

            that.wrapper.removeClass(DIRECTION_CLASSES).addClass("km-" + cssClass);
            that.arrow.css(offset, offsetAmount).show();

            that.trigger(SHOW);
        }
    });

    /**
     * @name kendo.mobile.ui.PopOver.Description
     * @section
     * <p>The mobile PopOver widget represents a transient view which is displayed when the user taps on a navigational widget
     * or area on the screen. It can contain one or more mobile views which can be navigated to, if needed.
     * The Mobile Application automatically instantiates a mobile PopOver for each div element with a <code>role</code>
     * data attribute set to <b>popover</b>.
     * Alternatively, it can be initialized using jQuery plugin syntax in the containing mobile View <strong>init event handler</strong>.
     * </p>
     *
     * <p>The Mobile PopOver widget can be open when any mobile navigational widget (listview link item, button, tabstrip, etc.) is tapped.
     * To do so, add <code>data-rel="popover"</code> attribute and a <code>href</code> attribute equal to the PopOver <code>id</code> to the navigational widget DOM element (prefixed with <code>#</code>, like an anchor).</p>
     *
     * @exampleTitle A Mobile PopOver displaying "Hello World"
     * @example
     * <div data-role="view">
     *  <a data-role="button" href="#foo" data-rel="popover">Say Hello</a>
     *
     *  <div data-role="popover">
     *      <div data-role="view">
     *          Hello world!
     *      </div>
     *  </div>
     * </div>
     *
     * @section
     * <p>The Mobile PopOver widget implicitly instantiates a pane widget for its contents, which allows the containing views to navigate to each
     * other. The pane widget behavior (including default transition, layout, etc.) may be configured from the <code>pane</code> configuration option.</p>
     * <p>The popover dimensions and direction can be configured from the <code>popup</code> configuration option.</p>
     */
    var PopOver = Widget.extend(/** @lends kendo.mobile.ui.PopOver.prototype */{
        /**
         * @constructs
         * @extends kendo.mobile.ui.Widget
         * @param {Element} element DOM element
         * @option {Object} [pane] The pane configuration options.
         * @option {String} [pane.layout] <> The id of the default Pane Layout.
         * @option {String} [pane.initial] <> The id of the initial mobile View to display.
         * @option {String} [pane.loading] <Loading...> The text displayed in the loading popup. Setting this value to false will disable the loading popup.
         * @option {String} [pane.transition] <> The default View transition.
         * @option {Object} [popup] The popup configuration options.
         * @option {Number | String} [popup.width] <240> The width of the popup in pixels.
         * @option {Number | String} [popup.height] <320> The height of the popup in pixels.
         * @option {Number | String} [popup.direction] <down> The direction to which the popup will expand, relative to the target that opened it.
         * Supported directions are up, right, down, and left.
         */
        init: function(element, options) {
            var that = this,
                popupOptions;

            Widget.fn.init.call(that, element, options);

            options = that.options;

            popupOptions = $.extend({
                "show": function() { that.trigger(OPEN); },
                "hide": function() { that.trigger(CLOSE); }
            }, this.options.popup);

            that.popup = new Popup(that.element, popupOptions);

            that.pane = new ui.Pane(that.element, this.options.pane).navigate("");

            kendo.notify(that, ui);
        },

        options: {
            name: "PopOver",
            popup: { },
            pane: { }
        },

        events: [
            /**
             * Fires when popover is opened.
             * @name kendo.mobile.ui.PopOver#open
             * @event
             * @param {Event} e
             */
            OPEN,
            /**
             * Fires when popover is closed.
             * @name kendo.mobile.ui.PopOver#close
             * @event
             * @param {Event} e
             */
            CLOSE
        ],

        /**
         * Open the ActionSheet.
         * @param {jQuery} target The target of the Popover, to which the visual arrow will point to.
         */
        openFor: function(target) {
            this.popup.show(target);
        },

        /**
         * Close the popover.
         * @exampleTitle Close a popover when a button is clicked
         * @example
         * <div data-role="popover" id="foo">
         *  <a data-role="button" data-click="closePopOver">Close</a>
         * </div>
         *
         * <script>
         *  function closePopOver() {
         *      $("#foo").data("kendoMobilePopOver").close();
         *  }
         * </script>
         */
        close: function() {
            this.popup.hide();
        }
    });

    ui.plugin(Popup);
    ui.plugin(PopOver);
})(jQuery);
(function($, undefined) {
    var kendo = window.kendo,
        ui = kendo.mobile.ui,
        Widget = ui.Widget,
        CAPTURE_EVENTS = ["touchstart", "touchend", "touchmove", "mousedown", "mousemove", "mouseup"];

    /**
     * @name kendo.mobile.ui.Loader.Description
     *
     */
    var Loader = Widget.extend(/** @lends kendo.mobile.ui.Loader.prototype */{
        /**
        * @constructs
        * @extends kendo.mobile.ui.Widget
        * @param {Element} element DOM element
        */
        init: function(container, options) {
            var that = this,
                element = $('<div class="km-loader"><span class="km-loading km-spin"></span></div>');

            Widget.fn.init.call(that, element, options);

            that.container = container;

            that._attachCapture();

            element.append(that.options.loading).hide().appendTo(container);
        },

        options: {
            name: "Loader",
            loading: "<h1>Loading...</h1>",
            timeout: 100
        },

        /**
         * Show the loading animation.
         * @example
         */
        show: function() {
            var that = this;

            clearTimeout(that._loading);

            if (that.options.loading === false) {
                return;
            }

            that._loading = setTimeout(function() {
                that.element.show();
            }, that.options.timeout);
        },

        /**
         * Hide the loading animation.
         * @example
         */
        hide: function() {
            var that = this;
            clearTimeout(that._loading);
            that.element.hide();
        },

        transition: function() {
            this.transitioning = true;
        },

        transitionDone: function() {
            this.transitioning = false;
        },

        _attachCapture: function() {
            var that = this;
            that.transitioning = false;

            function capture(e) {
                if (that.transitioning) {
                    e.stopPropagation();
                }
            }

            for (var i = 0; i < CAPTURE_EVENTS.length; i ++) {
                that.container[0].addEventListener(CAPTURE_EVENTS[i], capture, true);
            }
        }
    });

    ui.plugin(Loader);
})(jQuery);
(function($, undefined) {
    var kendo = window.kendo,
        mobile = kendo.mobile,
        fx = kendo.fx,
        ui = mobile.ui,
        proxy = $.proxy,
        extend = $.extend,
        Widget = ui.Widget,
        Class = kendo.Class,
        Movable = kendo.ui.Movable,
        Pane = kendo.ui.Pane,
        PaneDimensions = kendo.ui.PaneDimensions,
        Transition = fx.Transition,
        Animation = fx.Animation,
        SNAPBACK_DURATION = 500,
        SCROLLBAR_OPACITY = 0.7,
        FRICTION = 0.93,
        OUT_OF_BOUNDS_FRICTION = 0.5,
        RELEASECLASS = "km-scroller-release",
        REFRESHCLASS = "km-scroller-refresh",
        PULL = "pull",
        CHANGE = "change",
        RESIZE = "resize",
        SCROLL = "scroll";

    var DragInertia = Animation.extend({
        init: function(options) {
            var that = this;

            Animation.fn.init.call(that);

            extend(that, options, {
                transition: new Transition({
                    axis: options.axis,
                    movable: options.movable,
                    onEnd: function() { that._end(); }
                })
            });

            that.tap.bind("press", function() { that.cancel(); });
            that.drag.bind("end", proxy(that.start, that));
            that.drag.bind("tap", proxy(that.onEnd, that));
        },

        onCancel: function() {
            this.transition.cancel();
        },

        freeze: function(location) {
            var that = this;
            that.cancel();
            that._moveTo(location);
        },

        onEnd: function() {
            var that = this;
            if (that._outOfBounds()) {
                that._snapBack();
            } else {
                that._end();
            }
        },

        done: function() {
            return Math.abs(this.velocity) < 1;
        },

        start: function() {
            var that = this;

            if (!that.dimension.present()) { return; }

            if (that._outOfBounds()) {
                that._snapBack();
            } else {
                that.velocity = that.drag[that.axis].velocity * 16;
                if (that.velocity) {
                    that.tap.captureNext();
                    Animation.fn.start.call(that);
                }
            }
        },

        tick: function() {
            var that = this,
                dimension = that.dimension,
                friction = that._outOfBounds() ? OUT_OF_BOUNDS_FRICTION : FRICTION,
                delta = (that.velocity *= friction),
                location = that.movable[that.axis] + delta;

                if (!that.elastic && dimension.outOfBounds(location)) {
                    location = Math.max(Math.min(location, dimension.max), dimension.min);
                    that.velocity = 0;
                }

            that.movable.moveAxis(that.axis, location);
        },

        _end: function() {
            this.tap.cancelCapture();
            this.end();
        },

        _outOfBounds: function() {
            return this.dimension.outOfBounds(this.movable[this.axis]);
        },

        _snapBack: function() {
            var that = this,
                dimension = that.dimension,
                snapBack = that.movable[that.axis] > dimension.max ? dimension.max : dimension.min;
            that._moveTo(snapBack);
        },

        _moveTo: function(location) {
            this.transition.moveTo({ location: location, duration: SNAPBACK_DURATION, ease: Transition.easeOutExpo });
        }
    });

    var ScrollBar = Class.extend({
        init: function(options) {
            var that = this,
                horizontal = options.axis === "x",
                element = $('<div class="km-touch-scrollbar km-' + (horizontal ? "horizontal" : "vertical") + '-scrollbar" />');

            extend(that, options, {
                element: element,
                elementSize: 0,
                movable: new Movable(element),
                scrollMovable: options.movable,
                size: horizontal ? "width" : "height"
            });

            that.scrollMovable.bind(CHANGE, proxy(that._move, that));
            that.container.append(element);
        },

        _move: function() {
            var that = this,
                axis = that.axis,
                dimension = that.dimension,
                paneSize = dimension.size,
                scrollMovable = that.scrollMovable,
                sizeRatio = paneSize / dimension.total,
                position = Math.round(-scrollMovable[axis] * sizeRatio),
                size = Math.round(paneSize * sizeRatio);

                if (position + size > paneSize) {
                    size = paneSize - position;
                } else if (position < 0) {
                    size += position;
                    position = 0;
                }

            if (that.elementSize != size) {
                that.element.css(that.size, size + "px");
                that.elementSize = size;
            }

            that.movable.moveAxis(axis, position);
        },

        show: function() {
            this.element.css({opacity: SCROLLBAR_OPACITY, visibility: "visible"});
        },

        hide: function() {
            this.element.css({opacity: 0});
        }
    });

    /**
     * @name kendo.mobile.ui.Scroller.Description
     * @section
     * <p>The Kendo Mobile Scroller widget enables touch friendly kinetic scrolling for the contents of a given DOM element.  </p>
     *
     * <h3>Getting Started</h3>
     * <p>Each mobile View initializes a scroller for its content element. In addition to that, a scroller will be initialized for every element with a
     * <code>role</code> data attribute set to <code>scroller</code>.
     * Alternatively, it can be initialized using jQuery plugin syntax in the containing mobile View <strong>init event handler</strong>.
     * </p>
     * <p>For the scroller to work, its element should have fixed dimensions (width and/or height) set.</p>
     *
     * @exampleTitle Initialize mobile Scroller using a role data attribute.
     * @example
     * <div data-role="scroller">
     *   Foo
     * </div>
     *
     * @exampleTitle Initialize mobile Scroller using jQuery plugin syntax
     * @example
     * <div id="scroller"></div>
     * <script>
     * var scroller = $("#scroller").kendoMobileScroller();
     * </script>
     *
     * @exampleTitle Obtain the current mobile view scroller
     * @example
     * <div data-role="view" data-init="getScroller">
     *   Foo
     * </div>
     * <script>
     *  function getScroller(e) {
     *     var scroller = e.view.scroller;
     *  }
     * </script>
     *
     * @section
     * <p>The mobile Scroller widget exposes the following fields:</p>
     * <ul>
     * <li><strong>scrollTop</strong> - the number of pixels that are hidden from view above the scrollable area.</li>
     * <li><strong>scrollLeft</strong> - the number of pixels that are hidden from view to the left of the scrollable area.</li>
     * </ul>
     *
     */
    var Scroller = Widget.extend(/** @lends kendo.mobile.ui.Scroller.prototype */{
        /**
         * @constructs
         * @extends kendo.mobile.ui.Widget
         * @param {Element} element DOM element
         * @param {Object} options
         * @option {Boolean} [elastic] <true> Weather or not to allow out of bounds dragging and easing.
         * @option {Number} [pullOffset] <140> The threshold below which a releasing the scroller will trigger the pull event.
         * Has effect only when the pullToRefresh option is set to true.
         * @option {String} [pullTemplate] <Pull to refresh> The message template displayed when the user pulls the scroller.
         * Has effect only when the pullToRefresh option is set to true.
         * @option {Boolean} [pullToRefresh] <false> If set to true, the scroller will display a hint when the user pulls the container beyond its top limit.
         * If a pull beyond the specified pullOffset occurs, a pull event will be triggered.
         * @option {String} [releaseTemplate] <Release to refresh> The message template displayed when the user pulls the scroller below the
         * pullOffset, indicating that pullToRefresh will occur.
         * Has effect only when the pullToRefresh option is set to true.
         * @option {String} [refreshTemplate] <Refreshing> The message template displayed during the refresh.
         * Has effect only when the pullToRefresh option is set to true.
         */
        init: function(element, options) {
            var that = this;
            Widget.fn.init.call(that, element, options);

            element = that.element;

            element
                .css("overflow", "hidden")
                .addClass("km-scroll-wrapper")
                .wrapInner('<div class="km-scroll-container"/>')
                .prepend('<div class="km-scroll-header"/>');

            var inner = element.children().eq(1),

                tap = new kendo.Tap(element),

                movable = new Movable(inner),

                dimensions = new PaneDimensions({
                    element: inner,
                    container: element,
                    change: function() {
                        that.trigger(RESIZE);
                    }
                }),

                drag = new kendo.Drag(element, {
                    allowSelection: true,
                    start: function(e) {
                        dimensions.refresh();

                        if (dimensions.present()) {
                            drag.capture();
                        } else {
                            drag.cancel();
                        }
                    }
                }),

                pane = new Pane({
                    movable: movable,
                    dimensions: dimensions,
                    drag: drag,
                    elastic: that.options.elastic
                });

            movable.bind(CHANGE, function() {
                that.scrollTop = - movable.y;
                that.scrollLeft = - movable.x;

                that.trigger(SCROLL, {
                    scrollTop: that.scrollTop,
                    scrollLeft: that.scrollLeft
                });
            });

            extend(that, {
                movable: movable,
                dimensions: dimensions,
                drag: drag,
                pane: pane,
                tap: tap,
                pulled: false,
                scrollElement: inner,
                fixedContainer: element.children().first()
            });

            that._initAxis("x");
            that._initAxis("y");

            dimensions.refresh();

            if (that.options.pullToRefresh) {
                that._initPullToRefresh();
            }

            kendo.onResize($.proxy(that.reset, that));
        },

        /**
         * Returns the height in pixels of the scroller content.
         */
        scrollHeight: function() {
            return this.scrollElement[0].scrollHeight;
        },

        /**
         * Returns the width in pixels of the scroller content.
         */
        scrollWidth: function() {
            return this.scrollElement[0].scrollWidth;
        },

        options: {
            name: "Scroller",
            pullOffset: 140,
            elastic: true,
            pullTemplate: "Pull to refresh",
            releaseTemplate: "Release to refresh",
            refreshTemplate: "Refreshing"
        },

        events: [
            /**
             * Fires when the pull option is set to true, and the user pulls the scrolling container beyond the specified pullThreshold.
             * @name kendo.mobile.ui.Scroller#pull
             * @event
             * @param {Event} e
             */
            PULL,
            /**
             * Fires when the user scrolls through the content.
             * @name kendo.mobile.ui.Scroller#scroll
             * @event
             * @param {Event} e
             * @param {Number} e.scrollTop The number of pixels that are hidden from view above the scrollable area.
             * @param {Number} e.scrollLeft The number of pixels that are hidden from view to the left of the scrollable area.
             * @exampleTitle Bind to scroller scroll event in view init
             * @example
             * <div data-role="view" data-init="attachToScroller"> ... </div>
             *  <script>
             *     function attachToScroller(e) {
             *       var scroller = e.view.scroller;
             *       scroller.bind("scroll", function(e) {
             *          console.log(e.scrollTop);
             *          console.log(e.scrollLeft);
             *       });
             *     }
             *  </script>
             */
            SCROLL,
            /**
             * Fires when the scroller dimensions change (e.g. orientation change or resize)
             * @name kendo.mobile.ui.Scroller#resize
             * @event
             * @param {Event} e
             */
            RESIZE
        ],

        setOptions: function(options) {
            var that = this;
            Widget.fn.setOptions.call(that, options);
            if (options.pullToRefresh) {
                that._initPullToRefresh();
            }
        },

        /**
         * Scrolls the container to the top.
         */
        reset: function() {
            this.movable.moveTo({x: 0, y: 0});
        },

        /**
         * Scrolls the container to the specified location
         * @param {Number} x The horizontal offset in pixels to scroll to.
         * @param {Number} y The vertical offset in pixels to scroll to.
         */
        scrollTo: function(x, y) {
            this.movable.moveTo({x: x, y: y});
        },

        /**
         * Indicate that the pull event is handled (i.e. data from the server has been retrieved).
         * @exampleTitle Custom pull to refresh view scroll handling
         * @example
         *  <div data-role="view" data-init="initPullToRefreshScroller">
         *      <h2 id="pull-to-refresh-clock"></h2>
         *  </div>
         * <script>
         *
         *  function updateClock() {
         *      pullTime = kendo.toString(new Date(), "hh:mm:ss tt" );
         *      $("#pull-to-refresh-clock").html("Last update at " + pullTime + ". <br /> Pull to refresh.");
         *  }
         *
         *  function initPullToRefreshScroller(e) {
         *      var scroller = e.view.scroller;
         *
         *      scroller.setOptions({
         *          pullToRefresh: true,
         *          pull: function() {
         *              updateClock();
         *              setTimeout(function() { scroller.pullHandled(); }, 400);
         *          }
         *      })
         *  }
         * </script>
         */
        pullHandled: function() {
            var that = this;
            that.refreshHint.removeClass(REFRESHCLASS);
            that.hintContainer.html(that.pullTemplate({}));
            that.yinertia.onEnd();
            that.xinertia.onEnd();
        },

        _initPullToRefresh: function() {
            var that = this;

            that.pullTemplate = kendo.template(that.options.pullTemplate);
            that.releaseTemplate = kendo.template(that.options.releaseTemplate);
            that.refreshTemplate = kendo.template(that.options.refreshTemplate);

            that.scrollElement.prepend('<span class="km-scroller-pull"><span class="km-icon"></span><span class="km-template">' + that.pullTemplate({}) + '</span></span>');
            that.refreshHint = that.scrollElement.children().first();
            that.hintContainer = that.refreshHint.children(".km-template");

            that.pane.y.bind("change", proxy(that._paneChange, that));
            that.drag.bind("end", proxy(that._dragEnd, that));
        },

        _dragEnd: function() {
            var that = this;

            if(!that.pulled) {
                return;
            }

            that.pulled = false;
            that.refreshHint.removeClass(RELEASECLASS).addClass(REFRESHCLASS);
            that.hintContainer.html(that.refreshTemplate({}));
            that.trigger("pull");
            that.yinertia.freeze(that.options.pullOffset / 2);
        },

        _paneChange: function() {
            var that = this;

            if (that.movable.y / OUT_OF_BOUNDS_FRICTION > that.options.pullOffset) {
                if (!that.pulled) {
                    that.pulled = true;
                    that.refreshHint.removeClass(REFRESHCLASS).addClass(RELEASECLASS);
                    that.hintContainer.html(that.releaseTemplate({}));
                }
            } else if (that.pulled) {
                that.pulled = false;
                that.refreshHint.removeClass(RELEASECLASS);
                that.hintContainer.html(that.pullTemplate({}));
            }
        },

        _initAxis: function(axis) {
            var that = this,
            movable = that.movable,
            dimension = that.dimensions[axis],
            tap = that.tap,

            scrollBar = new ScrollBar({
                axis: axis,
                movable: movable,
                dimension: dimension,
                container: that.element
            }),

            inertia = new DragInertia({
                axis: axis,
                movable: movable,
                tap: tap,
                drag: that.drag,
                dimension: dimension,
                elastic: that.options.elastic,
                end: function() { scrollBar.hide(); }
            });

            that[axis + "inertia"] = inertia;

            that.pane[axis].bind(CHANGE, function() {
                scrollBar.show();
            });
        }
    });

    ui.plugin(Scroller);
})(jQuery);

(function($, undefined) {
    var kendo = window.kendo,
        ui = kendo.mobile.ui,
        Popup = kendo.ui.Popup,
        SHIM = '<div class="km-shim"/>',
        Widget = ui.Widget;

    var Shim = Widget.extend(/** @lends kendo.mobile.ui.Shim.prototype */{
        /**
        * @constructs
        * @extends kendo.mobile.ui.Widget
        * @param {Element} element DOM element
        */
        init: function(element, options) {
            var that = this,
                ios = kendo.mobile.application.os === "ios",
                align = options.align || (ios ?  "bottom center" : "center center"),
                position = options.position || (ios ? "bottom center" : "center center"),
                effect = options.effect || (ios ? "slideIn:up" : "fade:in"),
                shim = $(SHIM).hide(), view;

            Widget.fn.init.call(that, element, options);
            view = that.view();

            that.shim = shim;
            that.element = element;

            if (!that.options.modal) {
                that.shim.on(kendo.support.mouseup, $.proxy(that.hide, that));
            }

            view.container.append(shim);

            that.popup = new Popup(that.element, {
                anchor: shim,
                appendTo: shim,
                origin: align,
                position: position,
                animation: {
                    open: {
                        effects: effect,
                        duration: that.options.duration
                    },
                    close: {
                        duration: that.options.duration
                    }
                },
                deactivate: function() {
                    shim.hide();
                },
                open: function() {
                    shim.show();
                }
            });

            kendo.notify(that);
        },

        options: {
            name: "Shim",
            modal: true,
            align: undefined,
            position: undefined,
            effect: undefined,
            duration: 200
        },

        show: function() {
            this.popup.open();
        },

        hide: function() {
            this.popup.close();
        }
    });

    ui.plugin(Shim);
})(jQuery);
(function($, undefined) {
    var kendo = window.kendo,
        mobile = kendo.mobile,
        ui = mobile.ui,
        attr = kendo.attr,
        Class = kendo.Class,
        Widget = ui.Widget,
        INIT = "init",
        SHOW = "show",
        BEFORE_SHOW = "beforeShow",
        HIDE = "hide",
        Z_INDEX = "z-index",
        data = kendo.data,
        roleSelector = kendo.roleSelector;

    /**
     * @name kendo.mobile.ui.View.Description
     *
     * @section
     *
     * <p>The Kendo mobile View widget represents a screen in the kendo mobile Application. The
     * Application automatically instantiates a mobile View for each element with a <code>role</code> data attribute set
     * to <b>view</b>.</p>
     *
     * @exampleTitle Hello World mobile View
     * @example
     * <div data-role="view">Hello world!</div>
     *
     * @section
     * <h3>Headers and Footers</h3>
     * <p>By default, the mobile View contents stretch to fit the application element.
     * In addition to that, The mobile View may also have a header and a footer.
     * In order to mark header and footer elements, add block elements (<code>div</code>, <code>header</code>, <code>footer</code>, etc.) with attribute <code>data-role="header"</code> and
     * <code>data-role="footer"</code>. </p>
     *
     * @exampleTitle Mobile View with Header and Footer
     * @example
     * <div data-role="view">
     *   <div data-role="header">Header</div>
     *   Hello world!
     *   <div data-role="footer">Footer</div>
     * </div>
     *
     * @section
     * <strong>Important:</strong>
     * <p>Because of the OS UI design conventions, the header and the footer switch positions when an Android device is detected.
     * Usually the footer hosts a mobile Tabstrip widget, which is located at the bottom of the screen on iOS,
     * and at the top of the screen in Android applications.  </p>
     *
     * @section
     *
     * <h3>View Parameters</h3>
     *
     * <p>Navigational widgets can pass additional URL parameters when navigating to Views. The parameters will be accessible in the  view <code>show</code> event handlers.</p>
     *
     * @exampleTitle Button with additional URL parameters
     * @example
     * <a data-role="button" href="#foo?bar=baz">Link to FOO <strong>View</strong> with bar parameter set to baz</a>
     * <div data-role="view" id="foo" data-show="fooShow">
     * </div>
     *
     * <script>
     * function fooShow(e) {
     *      e.view.params // {bar: "baz"}
     * }
     * </script>
     *
     * @section
     * <h3>View DOM elements</h3>
     * <p>Each mobile View instance exposes the following fields:</p>
     * <ul>
     *  <li><b>header</b> - the view (or the applied mobile layout) header DOM element;</li>
     *  <li><b>footer</b> - the view (or the applied mobile layout) footer DOM element;</li>
     *  <li><b>content</b> - the view content DOM element;</li>
     *  <li><b>scrollerContent</b> - the view mobile scroller container DOM element. Recommended if the mobile View
     *  contents need to be manipulated or <b>replaced</b>.</li>
     * </ul>
     */
    var View = Widget.extend(/** @lends kendo.mobile.ui.View.prototype */{
        /**
         * @constructs
         * @extends kendo.mobile.ui.Widget
         * @param {Element} element DOM element.
         * @param {Object} options Configuration options.
         * @option {String} [title] <> The text to display in the navbar title (if present) and the browser title.
         * @option {Boolean} [stretch] <false> If set to true, the view will stretch its child contents to occupy the entire view, while disabling kinetic scrolling.
         * Useful if the view contains an image or a map.
         * @option {String | ObservableObject} [model] <null> The MVVM model to bind to. If a string is passed, The view
         * will try to resolve a reference to the view model variable in the global scope.
         * _exampleTitle Bind a Mobile View
         * _example
         * <script>
         *  var foo = { bar: "baz" }
         * </script>
         *
         * <div data-role="view" data-model="foo">
         *    <span data-bind="text:bar"></span>
         * </div>
         */
        init: function(element, options) {
            var that = this;

            Widget.fn.init.call(that, element, options);

            element = that.element;

            that.params = {};
            that.lastParams = {};

            $.extend(that, options);

            that._layout();
            that._scroller();
            that._model();
        },

        events: [
            /**
             * Fires after the mobile View and its child widgets are initialized.
             * @name kendo.mobile.ui.View#init
             * @event
             * @param {Event} e
             * @param {jQuery} e.view The mobile view instance
             */
            INIT,
            /**
             * Fires before the mobile View becomes visible. The event can be prevented by calling the <code>preventDefault</code> method of the event parameter, in case a redirection should happen.
             * @name kendo.mobile.ui.View#beforeShow
             * @event
             * @param {Event} e
             * @param {jQuery} e.view The mobile view instance
             */
            BEFORE_SHOW,
            /**
             * Fires when the mobile View becomes visible.
             * @name kendo.mobile.ui.View#show
             * @event
             * @param {Event} e
             * @param {jQuery} e.view The mobile view instance
             */
            SHOW,
            /**
             * Fires when the mobile View becomes hidden.
             * @name kendo.mobile.ui.View#hide
             * @event
             * @param {Event} e
             * @param {jQuery} e.view The mobile view instance
             */
            HIDE
        ],

        options: {
            name: "View",
            title: "",
            defaultTransition: "",
            stretch: false,
            model: null
        },

        showStart: function() {
            var that = this;
            that.element.css("display", "");

            if (!that.inited) {
                that.inited = true;
                that.trigger(INIT, {view: that});
            }

            if (that.layout) {
                that.layout.attach(that);
            }

            that._eachWidget(function(widget) {
                widget.viewShow(that);
            });

            that.trigger(SHOW, {view: that});
        },

        hideStart: function() {
            var that = this;
            if (that.layout) {
                that.layout.detach(that);
            }
        },

        hideComplete: function() {
            var that = this;
            that.element.hide();
            that.trigger(HIDE, {view: that});
        },

        updateParams: function(params) {
            var that = this;

            if (that.trigger(BEFORE_SHOW, {view: that})) {
                return;
            }

            that.lastParams = that.params;
            that.params = params;

            that.trigger(SHOW, {view: that});
        },

        switchWith: function(view, transition, params, callback) {
            var that = this;

            if (that.trigger(BEFORE_SHOW, {view: that})) {
                return;
            }

            that.lastParams = that.params;
            that.params = params;

            if (view) {
                // layout needs to be detached first, then reattached
                view.hideStart();
                that.showStart();

                new ViewTransition({
                    current: view,
                    next: that,
                    transition: transition,
                    defaultTransition: view.options.defaultTransition,
                    complete: callback
                });
            } else {
                that.showStart();
                callback();
            }
        },

        parallaxContents: function(other) {
            var that = this,
                contents = that.content;

            if (!other.header[0]) {
                contents = contents.add(that.header);
            }

            if (!other.footer[0]) {
                contents = contents.add(that.footer);
            }

            return contents;
        },

        _scroller: function() {
            var that = this;

            if (that.options.stretch) {
                that.content.addClass("km-stretched-view");
            } else {
                that.content.kendoMobileScroller();

                that.scroller = that.content.data("kendoMobileScroller");
                that.scrollerContent = that.scroller.scrollElement;
            }
        },

        _model: function() {
            var that = this,
                element = that.element,
                model = that.options.model;

            if (typeof model === "string") {
                model = kendo.getter(model)(window);
            }

            that.model = model;

            element.find(roleSelector("popover")).each(function(){
                kendo.initWidget(this, {}, ui.roles);
            });

            if (model) {
                kendo.bind(element.children(), model, ui);
            } else {
                mobile.init(element.children());
            }
        },

        _layout: function() {
            var that = this,
                contentSelector = roleSelector("content"),
                element = that.element;

            element.data("kendoView", that).addClass("km-view");
            that.transition = data(element, "transition");

            that.header = element.children(roleSelector("header")).addClass("km-header");
            that.footer = element.children(roleSelector("footer")).addClass("km-footer");

            if (!element.children(contentSelector)[0]) {
              element.wrapInner("<div " + attr("role") + '="content"></div>');
            }

            that.content = element.children(roleSelector("content"))
                                .addClass("km-content");

            that.element.prepend(that.header).append(that.footer);

            that.id = data(element, "url") || "#" + element.attr("id");

            if (that.layout) {
                that.layout.setup(that);
            }
        },

        _eachWidget: function(callback) {
            var widget;
            this.element.find("[data-" + kendo.ns + "role]").each(function() {
                widget = kendo.widgetInstance($(this), ui);
                if (widget) {
                    callback(widget);
                }
            });
        }
    });

    function fade(source, destination) {
        if (source[0] && destination[0] && source[0] != destination[0]) {
            source.kendoAnimateTo(destination, {effects: "fade"});
        }
    }

    var ViewTransition = Class.extend({
        init: function (options) {
            $.extend(this, options);

            var that = this,
                current = that.current,
                next = that.next,
                currentContent = current.element,
                nextContent = next.element,
                upper = next,
                lower = current,
                transition = that._transition();

            if (transition.reverse && !transition.parallax) {
                upper = current;
                lower = next;
            }

            upper.element.css(Z_INDEX, 1);
            lower.element.css(Z_INDEX, 0);

            if (transition.parallax) {
                fade(current.footer, next.footer);
                fade(current.header, next.header);
                currentContent = current.parallaxContents(next);
                nextContent = next.parallaxContents(current);
            }

            currentContent.kendoAnimateTo(nextContent, transition);

            if (!that.back()) {
                current.nextView = next;
                current.backTransition = transition.transition;
            }
        },

        _transition: function() {
            var that = this,
                current = that.current,
                next = that.next,
                back = that.back(),
                complete = function() {
                    current.hideComplete();
                    that.complete();
                },

                viewTransition = back ? next.backTransition : next.transition,
                transition = that.transition || viewTransition || that.defaultTransition,
                animationData = transition.split(' '),
                animationType = animationData[0],
                parallax = /^slide/.test(animationType),
                reverse = animationData[1] === "reverse";

            if (that.back() && !that.transition) {
                reverse = !reverse;
            }

            return {
                effects: animationType,
                reverse: reverse,
                parallax: parallax,
                complete: complete,
                transition: transition
            };
        },

        back: function() {
            var next = this.next,
                current = this.current;

            return next.nextView === current && JSON.stringify(next.params) === JSON.stringify(next.lastParams);
        }
    });

    /**
     * @name kendo.mobile.ui.Layout.Description
     *
     * @section
     *
     * <p>A mobile <strong>Layout</strong> is used to share headers and footers between multiple <strong>Views</strong>.
     * The header and/or footer element of the <strong>Layout</strong> are applied to any <strong>View</strong> that uses it.</p>
     *
     * <p>To define a <strong>Layout</strong> set <code>data-role="layout"</code> to an element.
     *
     * <p>When a view with the given layout is displayed, the layout attaches its header and footer to it.</p>
     *
     * <p><strong>Note:</strong> When instantiated, the layout detaches its element from the document tree.</p>
     *
     * <p>A <strong>View</strong> is associated with a <strong>Layout</strong> by setting its <code>data-layout</code> attribute value
     * to the value of the layout's <code>data-id</code> attribute:</p>
     *
     * @exampleTitle Views with Layout
     * @example
     * <div data-role="view" data-layout="foo">Foo</div>
     * <div data-role="view" data-layout="foo">Bar</div>
     *
     * <div data-role="layout" data-id="foo">
     *   <div data-role="header">Header</div>
     *   <div data-role="footer">Footer</div>
     * </div>
     *
     * @section
     * <p>A default <strong>Application</strong> layout can be set by passing the layout id in the <code>options</code> parameter of the <strong>Application</strong>'s constructor.
     * A mobile <strong>View</strong> can remove the default application <strong>Layout</strong> by setting <code>data-layout=""</code>.</p>
     *
     * @exampleTitle Default Application Layout
     * @example
     * <div data-role="view">Bar</div>
     *
     * <div data-role="layout" data-id="foo">
     *   <div data-role="header">Header</div>
     * </div>
     *
     * <script>
     *    new kendo.mobile.Application($(document.body), { layout: "foo" });
     * </script>
     *
     * @section
     * <p>Layouts can be platform specific, allowing for different layout and behavior per platform.
     * A layout platform can be specified using <code>data-platform=""</code></p>
     *
     * @exampleTitle iOS and Android Application Layout
     * @example
     * <div data-role="view">Bar</div>
     *
     * <div data-role="layout" data-id="foo" data-platform="ios">
     *   <div data-role="header">Header</div>
     * </div>
     *
     * <div data-role="layout" data-id="foo" data-platform="android">
     *   <div data-role="header">Header</div>
     * </div>
     *
     * @section
     * <h3>Layout DOM elements</h3>
     * <p>Each mobile Layout instance exposes the following fields:</p>
     * <ul>
     *  <li><b>header</b> - the header DOM element;</li>
     *  <li><b>footer</b> - the footer DOM element;</li>
     * </ul>
     */
    var Layout = Widget.extend(/** @lends kendo.mobile.ui.Layout.prototype */{
        /**
         * @constructs
         * @extends kendo.mobile.ui.Widget
         * @param {Element} element DOM element.
         * @param {Object} options Configuration options.
         * @option {String} [id] <null> The id of the layout. Required.
         * @option {String} [platform] <> The specific platform this layout targets. By default, layouts are displayed
         * on all platforms.
         */
        init: function(element, options) {
            var that = this;
            Widget.fn.init.call(that, element, options);

            element = that.element;

            that.element = element.detach();
            that.header = element.children(roleSelector("header")).addClass("km-header");
            that.footer = element.children(roleSelector("footer")).addClass("km-footer");
            that.elements = that.header.add(that.footer);
            kendo.mobile.init(that.element.children());
            that.trigger(INIT, {layout: that});
        },

        options: {
            name: "Layout"
        },

        events: [
            /**
             * Fires after a mobile Layout and its child widgets is initialized.
             * @name kendo.mobile.ui.Layout#init
             * @event
             * @param {Event} e
             * @param {jQuery} e.layout The mobile layout instance
             */
            INIT,
            /**
             * Fires when a mobile View using the layout becomes visible.
             * @name kendo.mobile.ui.Layout#show
             * @event
             * @param {Event} e
             * @param {jQuery} e.layout The mobile layout instance
             * @param {jQuery} e.view The mobile view instance
             */
            SHOW,
            /**
             * Fires when a mobile View using the layout becomes hidden.
             * @name kendo.mobile.ui.Layout#hide
             * @event
             * @param {Event} e
             * @param {jQuery} e.layout The mobile layout instance
             * @param {jQuery} e.view The mobile view instance
             */
            HIDE
        ],

        setup: function (view) {
            if (!view.header[0]) { view.header = this.header; }
            if (!view.footer[0]) { view.footer = this.footer; }
        },

        detach: function (view) {
            var that = this;
            if (view.header === that.header) {
                view.element.prepend(that.header.detach().clone(true));
            }

            if (view.footer === that.footer) {
                view.element.append(that.footer.detach().clone(true));
            }

            that.trigger(HIDE, {layout: that, view: view});
        },

        attach: function(view) {
            var that = this;
            if (view.header === that.header) {
                that.header.detach();
                view.element.children(roleSelector("header")).remove();
                view.element.prepend(that.header);
            }

            if (view.footer === that.footer) {
                that.footer.detach();
                view.element.children(roleSelector("footer")).remove();
                view.element.append(that.footer);
            }

            that.trigger(SHOW, {layout: that, view: view});
        }
    });

    var Observable = kendo.Observable,
        BODY_REGEX = /<body[^>]*>(([\u000a\u000d\u2028\u2029]|.)*)<\/body>/i,
        LOAD_START = "loadStart",
        LOAD_COMPLETE = "loadComplete",
        SHOW_START = "showStart",
        VIEW_SHOW = "viewShow";

    function urlParams(url) {
        var queryString = url.split('?')[1] || "",
            params = {},
            paramParts = queryString.split(/&|=/),
            length = paramParts.length,
            idx = 0;

        for (; idx < length; idx += 2) {
            params[paramParts[idx]] = paramParts[idx + 1];
        }

        return params;
    }

    var ViewEngine = Observable.extend({
        init: function(options) {
            var that = this,
                views;

            Observable.fn.init.call(that);

            $.extend(that, options);
            that.sandbox = $("<div />");

            views = that._hideViews(that.container);
            that.rootView = views.first();
            that._view = null;

            that.layouts = {};

            that._setupLayouts(that.container);

            if (that.loader) {
                that.bind(SHOW_START, function() { that.loader.transition(); });
                that.bind(LOAD_START, function() { that.loader.show(); });
                that.bind(LOAD_COMPLETE, function() { that.loader.hide(); });
                that.bind(VIEW_SHOW, function() { that.loader.transitionDone(); });
            }
        },

        view: function() {
            return this._view;
        },

        showView: function(url, transition) {
            var that = this,
                container = that.container,
                params = urlParams(url),
                firstChar = url.charAt(0),
                local = firstChar === "#",
                remote = firstChar === "/",
                view,
                element;

            if (url === that.url) {
                return;
            }

            that.url = url;
            that.trigger(SHOW_START);

            if (!url) {
                element = that.rootView;
            } else {
                element = container.children("[" + attr("url") + "='" + url + "']");

                if (!element[0] && !remote) {
                    element = container.children(local ? url : "#" + url);
                }
            }

            view = element.data("kendoView");

            if (element[0]) {
                if (!view) {
                    view = that._createView(element);
                }

                that._show(view, transition, params);
            } else {
                that._loadView(url, function(view) { that._show(view, transition, params); });
            }
        },

        _createView: function(element) {
            var that = this,
                viewOptions,
                layout = data(element, "layout");

            if (typeof layout === "undefined") {
                layout = that.layout;
            }

            if (layout) {
                layout = that.layouts[layout];
            }

            viewOptions = {
                defaultTransition: that.transition,
                loader: that.loader,
                container: that.container,
                layout: layout
            };

            return kendo.initWidget(element, viewOptions, ui.roles);
        },

        _loadView: function(url, callback) {
            var that = this;

            if (that._xhr) {
                that._xhr.abort();
            }

            that.trigger(LOAD_START);

            that._xhr = $.get(url, function(html) {
                            that.trigger(LOAD_COMPLETE);
                            callback(that._createRemoteView(url, html));
                        }, 'html')
                        .fail(function() {
                            that.trigger(LOAD_COMPLETE);
                        });
        },

        _createRemoteView: function(url, html) {
            var that = this,
                sandbox = that.sandbox,
                container = that.container,
                views,
                view;

            if (BODY_REGEX.test(html)) {
                html = RegExp.$1;
            }

            sandbox[0].innerHTML = html;

            views = that._hideViews(sandbox);
            view = views.first();

            view.hide().attr(attr("url"), url);

            that._setupLayouts(sandbox);

            container.append(sandbox.children(roleSelector("layout") + ", script, style"))
                .append(views);

            return that._createView(view);
        },

        _show: function(view, transition, params) {
            var that = this;
            if (that._view !== view) {
                view.switchWith(that._view, transition, params, function() {
                    that._view = view;
                    that.trigger(VIEW_SHOW, {view: view});
                });
            } else {
                that._view.updateParams(params);
                that.trigger(VIEW_SHOW, {view: view});
            }
        },

        _hideViews: function(container) {
            return container.children(roleSelector("view splitview")).hide();
        },

        _setupLayouts: function(element) {
            var that = this;

            element.children(roleSelector("layout")).each(function() {
                var layout = $(this),
                    platform = data(layout,  "platform");

                if (platform === undefined || platform === mobile.application.os) {
                    that.layouts[layout.data("id")] = kendo.initWidget(layout, {}, ui.roles);
                }
            });
        }
    });

    kendo.mobile.ViewEngine = ViewEngine;

    ui.plugin(View);
    ui.plugin(Layout);
})(jQuery);
(function($, undefined) {
    var kendo = window.kendo,
        ui = kendo.mobile.ui,
        Shim = ui.Shim,
        Widget = ui.Widget,
        OPEN = "open",
        WRAP = '<div class="km-modalview-wrapper" />';

    /**
     * @name kendo.mobile.ui.ModalView.Description
     * @section
     * <p>The Kendo ModalView is used to present self-contained functionality in the context of the current task.  </p>
     *
     * <h3>Getting Started</h3>
     * <p>The Kendo mobile Application will automatically initialize a mobile ModalView widget for every <code>div</code> element with <code>role</code> data attribute set to <code>modalview</code> present in the views/layouts markup.
     * Alternatively, it can be initialized using jQuery plugin syntax. The ModalView element may contain optional header and/or footer. A mobile scroller is automatically initialized around the contents of the element.</p>
     *
     * @exampleTitle ModalView with header and footer
     * @example
     * <div data-role="view">
     *  <a href="#foo" data-rel="modalview">Foo</a>
     *  <div data-role="modalview" id="foo">
     *    <div data-role="header">
     *        <div data-role="navbar">
     *            <a data-align="right" data-role="button">Close</a>
     *        </div>
     *    </div>
     *
     *    <ul data-role="listview">
     *      <li>Foo</li>
     *    </ul>
     *
     *    <div data-role="footer">
     *       <div data-role="navbar">
     *           <a data-align="right" data-role="button">Details</a>
     *       </div>
     *    </div>
     *  </div>
     * </div>
     *
     *
     * @section
     * <h3>Opening a ModalView</h3>
     * <p>The widget can be open when any mobile navigational widget (listview, button, tabstrip, etc.) is tapped.
     * To do so, the navigational widget should have <code>data-rel="modalview"</code> and <code>href</code> attribute pointing to the ModalView's element <code>id</code> set (prefixed with <code>#</code>, like an anchor).</p>
     *
     * @exampleTitle Button, which opens a ModalView
     * @example
     * <div data-role="view">
     *  <a href="#foo" data-rel="modalview">Foo</a>
     *  <div data-role="modalview" id="foo">
     *   ...
     *  </div>
     * </div>
     *
     * @exampleTitle Button, which closes a ModalView
     * @example
     * <div data-role="view">
     *  <a href="#foo" data-rel="modalview">Foo</a>
     *  <div data-role="modalview" id="foo">
     *    <div data-role="header">
     *        <div data-role="navbar">
     *            <a data-align="right" data-click="closeModalView" data-role="button">Close</a>
     *        </div>
     *    </div>
     *
     *   Foo
     *  </div>
     * </div>
     *
     * <script>
     * function closeModalView(e) {
     *  // find the closest modal view, relative to the button element.
     *  var modalView = e.sender.element.closest("[data-role=modalview]").data("kendoMobileModalView");
     *  modalView.close();
     * }
     * </script>
     */
    var ModalView = ui.View.extend(/** @lends kendo.mobile.ui.ModalView.prototype */{
        /**
         * @constructs
         * @extends kendo.mobile.ui.Widget
         * @param {Element} element DOM element.
         * @param {Object} options Configuration options.
         * @option {Number} [width] The width of the ModalView container in pixels. If not set, the element style is used.
         * @option {Number} [height] The height of the ModalView container in pixels. If not set, the element style is used.
         * @option {Boolean} [modal] <true> When set to false, the ModalView will close when the user taps outside of its element.
         */
        init: function(element, options) {
            var that = this;

            Widget.fn.init.call(that, element, options);

            element = that.element;
            options = that.options;

            element.addClass("km-modalview").wrap(WRAP);

            that.wrapper = element.parent().css({
                width: options.width || element[0].style.width || 300,
                height: options.height || element[0].style.height || 300
            });
            element.css({ width: "", height: "" });

            that.shim = new Shim(that.wrapper, {
                modal: options.modal,
                position: "center center",
                align: "center center",
                effect: "fade:in"
            });

            that._layout();
            that._scroller();
        },

        events: [
            /**
             * Fires when the ModalView is shown.
             * @name kendo.mobile.ui.ModalView#open
             * @event
             * @param {Event} e
             * @param {jQuery} e.target The invocation target of the ModalView.
             * @example
             * <div data-role="view">
             *  <a href="#foo" data-rel="modalview">Foo</a>
             *  <div data-role="modalview" id="foo" data-open="logTarget">
             *   Foo
             *  </div>
             * </div>
             *
             * <script>
             * function logTarget(e) {
             *   console.log(e.target); // <a href="#foo" ...
             * }
             * </script>
             *
             */
            OPEN
        ],

        options: {
            name: "ModalView",
            modal: true
        },

        /**
         * Open the ModalView
         * @param {jQuery} target (optional) The target of the ModalView
         */
        open: function(target) {
            var that = this;
            that.trigger(OPEN);
            that.target = $(target);
            that.shim.show();
        },

        openFor: function(target) {
            var that = this;
            that.target = target;
            that.trigger(OPEN, { target: that.target });
            that.shim.show();
        },

        /**
         * Close the ModalView
         */
        close: function() {
            this.shim.hide();
        }
    });

    ui.plugin(ModalView);
})(jQuery);
(function($, undefined) {
    var kendo = window.kendo,
        ui = kendo.mobile.ui,
        Widget = ui.Widget,
        View = ui.View;

    /**
     * @name kendo.mobile.ui.SplitView.Description
     * @section
     * <p>The mobile SplitView is a tablet-specific view that consists of two or more <strong>mobile Pane widgets</strong>. The
     * Mobile Application automatically instantiates a mobile SplitView for each element with a <code>role</code> data attribute set
     * to <b>splitview</b>. </p>
     * <p> <strong>Important:</strong> unlike most widgets, the splitview element <strong>should not be nested</strong>
     * in a view, but should be put as an immediate child of the mobile application element.</p>
     *
     * @exampleTitle Mobile SplitView with two panes
     * @example
     * <div data-role="splitview">
     *
     *   <div data-role="pane" id="side-pane">
     *     <div data-role="view" data-title="Messages">
     *        <ul data-role="listview">
     *          <li><a href="#foo" data-target="main-pane">Foo</a></li><!-- link to main pane -->
     *          <li><a href="#bar">Bar</a></li><!-- link to same pane -->
     *        </ul>
     *     </div>
     *   </div>
     *
     *   <div data-role="pane" data-layout="main-default" id="main-pane">
     *     <div data-role="view" data-title="Messages">
     *         No message selected
     *     </div>
     *
     *     ...
     *
     *     <div data-role="layout" data-id="main-default">
     *         <div data-role="header">
     *             <div data-role="navbar">
     *                 <span data-role="view-title"></span>
     *             </div>
     *         </div>
     *     </div>
     *   </div>
     *
     * </div>
     *
     * @section
     * <h3>Customizing appearance</h3>
     * By default Kendo UI Mobile is configured to show a horizontal SplitView with smaller left and bigger right pane in 1:2 proportion.
     * In order to resize one of the panes, use CSS to set its width or adjust the flexibility of the flex boxes (if the width is set, the other pane flexibility should be set to a high numer, like 1000).
     *
     * @exampleTitle Set pane width to 300px or change the proportions to 1:3
     * @example
     * <div data-role="splitview" id="main">
     *   <div data-role="pane" id="side-pane">
     *     <div data-role="view">
     *        <a data-role="button" href="#bar" data-target="main-pane">Bar (main pane)</a>
     *        <a data-role="button" href="#baz" data-target="_top">Baz (application)</a>
     *     </div>
     *   </div>
     *   <div data-role="pane" id="main-pane">
     *     <div data-role="view" id="foo">
     *        Foo
     *     </div>
     *     <div data-role="view" id="bar">
     *        Bar
     *     </div>
     *   </div>
     * </div>
     *
     * <style>
     *     #side-pane { width: 300px; }
     *     #main-pane { -webkit-box-flex: 1000; }
     * </style>
     * or
     * <style>
     *     #main-pane { -webkit-box-flex: 3; }
     * </style>
     *
     * @section
     * Additionally you can split your view to more panes by adding them directly. You can also make them stack vertically
     * by setting data-style="vertical" on your SplitView.
     *
     * @exampleTitle Make SplitView to stack vertically.
     * @example
     * <div data-role="splitview" id="main" data-style="vertical">
     *   <div data-role="pane" id="side-pane">
     *     <div data-role="view">
     *        <a data-role="button" href="#bar" data-target="main-pane">Bar (main pane)</a>
     *        <a data-role="button" href="#baz" data-target="_top">Baz (application)</a>
     *     </div>
     *   </div>
     *   <div data-role="pane" id="main-pane">
     *     <div data-role="view" id="foo">
     *        Foo
     *     </div>
     *     <div data-role="view" id="bar">
     *        Bar
     *     </div>
     *   </div>
     * </div>
     */
    var SplitView = View.extend(/** @lends kendo.mobile.ui.SplitView.prototype */{
        /**
         * @constructs
         * @extends kendo.mobile.ui.Widget
         * @param {Element} element DOM element
         */
        init: function(element, options) {
            var that = this;

            Widget.fn.init.call(that, element, options);
            element = that.element;

            $.extend(that, options);
            that._layout();
            that._style();
            kendo.mobile.init(element.children(kendo.roleSelector("modalview")));

            that.panes = [];
            that.element.children(kendo.roleSelector("pane")).each(function() {
                that.panes.push(kendo.initWidget(this, {}, ui.roles));
            });
        },

        options: {
            name: "SplitView",
            style: "horizontal"
        },

        // Implement view interface
        _layout: function() {
            var that = this,
                element = that.element;

            element.data("kendoView", that).addClass("km-view km-splitview");

            that.transition = kendo.data(element, "transition");
            $.extend(that, { header: [], footer: [], content: element });
        },

        _style: function () {
            var style = this.options.style,
                element = this.element,
                styles;

            if (style) {
                styles = style.split(" ");
                $.each(styles, function () {
                    element.addClass("km-split-" + this);
                });
            }
        },

        showStart: function() {
            var that = this;
            that.element.css("display", "");

            if (!that.inited) {
                that.inited = true;
                $.each(that.panes, function() {
                    this.navigate("");
                });
                that.trigger("init", {view: that});
            }

            that.trigger("show", {view: that});
        }
    });

    ui.plugin(SplitView);
})(jQuery);
(function($, undefined) {
    var kendo = window.kendo,
        support = kendo.support,
        mobile = kendo.mobile,
        roleSelector = kendo.roleSelector,
        ui = mobile.ui,
        Widget = ui.Widget,
        ViewEngine = mobile.ViewEngine,
        Loader = mobile.ui.Loader,

        EXTERNAL = "external",
        HREF = "href",
        DUMMY_HREF = "#!",

        NAVIGATE = "navigate",
        VIEW_SHOW = "viewShow",

        WIDGET_RELS = /popover|actionsheet|modalview/,
        BACK = "#:back",

        data = kendo.data,
        // navigation element roles
        buttonRoles = "button backbutton detailbutton listview-link",
        linkRoles = "tab";

    function appLinkClick(e) {
        if(data($(e.currentTarget), "rel") != EXTERNAL) {
            e.preventDefault();
        }
    }

    /**
     * @name kendo.mobile.ui.Pane.Description
     * @section
     * <h3>Mobile Pane</h3>
     * <p>The mobile Pane widget groups one or more <strong>mobile views</strong> within the main view application. The mobile
     * SplitView widget allows a side by-side display of several panes. The mobile PopOver automatically instantiates a mobile Pane widget for its
     * contents.</p>
     *
     * @section
     * <p>The mobile Pane widget acts like an embedded mobile application, with most of the application
     * features available: support for local/remote views, default layout and transition, lading, etc. with one
     * exception being the browser history support. Navigating within the pane will not update the history state, so
     * deep linking to a pane state is not supported.</p>
     *
     * @section
     * <h3>Navigating across panes</h3>
     *
     * <p>By default, navigational widgets will change views in the containing pane. To target another pane, use
     * <code>target</code> data attribute set to the <strong>id</strong> of the pane. To change views in the mobile
     * application, use <code>data-target="_top"</code>.</p>
     *
     * @exampleTitle Navigating across panes
     * @example
     * <div data-role="splitview" id="main">
     *    <div data-role="pane" id="side-pane">
     *      <div data-role="view">
     *         <a data-role="button" href="#bar" data-target="main-pane">Bar (main pane)</a>
     *         <a data-role="button" href="#baz" data-target="_top">Baz (application)</a>
     *      </div>
     *    </div>
     *
     *    <div data-role="pane" id="main-pane">
     *      <div data-role="view" id="foo">
     *         Foo
     *      </div>
     *      <div data-role="view" id="bar">
     *         Bar
     *      </div>
     *    </div>
     *  </div>
     *
     *  <div data-role="view" id="baz">
     *     <a data-role="button" href="#main">Go back to splitview</a>
     *  </div>
     */
    var Pane = Widget.extend(/** @lends kendo.mobile.ui.Pane.prototype */{
        /**
         * @constructs
         * @extends kendo.mobile.ui.Widget
         * @param {Element} element DOM element
         * @param {Object} options Configuration options.
         * @option {String} [layout] <> The id of the default Pane Layout.
         * @option {String} [initial] <> The id of the initial mobilie View to display.
         * @option {String} [loading] <Loading...> The text displayed in the loading popup. Setting this value to false will disable the loading popup.
         * @option {String} [transition] <> The default View transition.
         */
        init: function(element, options) {
            var that = this;

            Widget.fn.init.call(that, element, options);

            element = that.element;

            element.addClass("km-pane");

            that.loader = new Loader(element, {
                loading: that.options.loading
            });

            that.viewEngine = new ViewEngine({
                container: element,
                transition: that.options.transition,
                layout: that.options.layout,
                loader: that.loader
            });

            that.viewEngine.bind(VIEW_SHOW, function(e) {
                that.trigger(VIEW_SHOW, e);
            });

            that.history = [];
            that._setupAppLinks();
        },

        options: {
            name: "Pane",
            transition: "",
            layout: "",
            loading: undefined
        },

        events: [
            /**
             * Fires when pane navigates to a view.
             * @name kendo.mobile.ui.Pane#navigate
             * @event
             * @param {Event} e
             * @param {jQuery} e.url The url of the view
             */
            NAVIGATE,
            /**
             * Fires after the pane displays a view.
             * @name kendo.mobile.ui.Pane#viewShow
             * @event
             * @param {Event} e
             * @param {View} e.view The displayed view
             */
            VIEW_SHOW
        ],

        /**
         * Navigate the local or remote view.
         * @param {String} url The id or url of the view.
         * @param {String} transition The transition to apply when navigating. See View Transitions section for more
         * information.
         *
         * @exampleTitle Navigate to a remote view
         * @example
         * <div data-role="pane" id="main-pane">
         * </div>
         *
         * <script>
         * var pane = $("#main-pane").data("kendoMobilePane");
         * pane.navigate("settings.html");
         * </script>
         *
         * @exampleTitle Navigate to a local view
         * @example
         * <div data-role="pane" id="main-pane">
         *   <div data-role="view" id="foo"> ... </div>
         * </div>
         *
         * <script>
         * var pane = $("#main-pane").data("kendoMobilePane");
         * pane.navigate("#foo");
         * </script>
         */
        navigate: function(url, transition) {
            var that = this,
                history = that.history;

            that.trigger(NAVIGATE, {url: url});

            if (url === BACK) {
                history.pop();
                url = history[history.length - 1];
            } else {
                that.history.push(url);
            }

            that.viewEngine.showView(url, transition);
        },

        /**
         * Hide the loading animation.
         */
        hideLoading: function() {
            this.loader.hide();
        },

        /**
         * Show the loading animation.
         */
        showLoading: function() {
            this.loader.show();
        },

        /**
         * Get a reference to the current view.
         * @returns {View} the view instance.
         */
        view: function() {
            return this.viewEngine.view();
        },

        _setupAppLinks: function() {
            var that = this,
                mouseup = $.proxy(that._mouseup, that);

            this.element
                .on(support.mousedown, roleSelector(linkRoles), mouseup)
                .on(support.mouseup, roleSelector(buttonRoles), mouseup)
                .on("click", roleSelector(linkRoles + " " + buttonRoles), appLinkClick);
        },

        _mouseup: function(e) {
            if (e.which > 1 || e.isDefaultPrevented()) {
                return;
            }

            var link = $(e.currentTarget),
                transition = data(link, "transition"),
                rel = data(link, "rel") || "",
                target = data(link, "target"),
                pane = this,
                href = link.attr(HREF);

            if (rel === EXTERNAL || (typeof href === "undefined") || href === DUMMY_HREF) {
                return;
            }

            // Prevent iOS address bar progress display for in app navigation
            link.attr(HREF, DUMMY_HREF);
            setTimeout(function() { link.attr(HREF, href); });

            if (rel.match(WIDGET_RELS)) {
                kendo.widgetInstance($(href), ui).openFor(link);
            } else {
                if (target === "_top") {
                    pane = mobile.application.pane;
                }
                else if (target) {
                    pane = $("#" + target).data("kendoMobilePane");
                }

                pane.navigate(href, transition);
            }

            e.preventDefault();
        }
    });

    ui.plugin(Pane);
})(jQuery);
(function($, undefined) {
    var kendo = window.kendo,
        mobile = kendo.mobile,
        history = kendo.history,
        support = kendo.support,
        Pane = mobile.ui.Pane,

        DEFAULT_OS = "ios",
        OS = support.mobileOS,
        OS_NAME_TEMPLATE = kendo.template("#=data.name##if(data.version){# #=data.name##=data.version.major# km-m#=data.version.minor# #=data.version.appMode?'km-app':'km-web'##}#", {usedWithBlock: false}),
        BERRYPHONEGAP = OS.device == "blackberry" && OS.flatVersion >= 600 && OS.flatVersion < 1000 && OS.appMode,
        VERTICAL = "km-vertical",
        HORIZONTAL = "km-horizontal",

        MOBILE_PLATFORMS = {
            ios: { ios: true, appMode: false, browser: "default", device: "iphone", flatVersion: "430", majorVersion: "4", minorVersion: "3.0", name: "ios", tablet: false },
            android: { android: true, appMode: false, browser: "default", device: "android", flatVersion: "233", majorVersion: "2", minorVersion: "3.3", name: "android", tablet: false },
            blackberry: { blackberry: true, appMode: false, browser: "default", device: "blackberry", flatVersion: "710", majorVersion: "7", minorVersion: "1.0", name: "blackberry", tablet: false },
            meego: { meego: true, appMode: false, browser: "default", device: "meego", flatVersion: "850", majorVersion: "8", minorVersion: "5.0", name: "meego", tablet: false }
        },

        viewportTemplate = kendo.template('<meta content="initial-scale=1.0, maximum-scale=1.0, user-scalable=no, width=device-width#=data.height#" name="viewport" />', {usedWithBlock: false}),
        meta = '<meta name="apple-mobile-web-app-capable" content="yes" /> ' +
               '<meta name="apple-mobile-web-app-status-bar-style" content="black" /> ' +
                viewportTemplate({ height: "" }),

        iconMeta = kendo.template('<link rel="apple-touch-icon' + (support.mobileOS.android ? '-precomposed' : '') + '" # if(data.size) { # sizes="#=data.size#" #}# href="#=data.icon#" />', {usedWithBlock: false}),

        HIDEBAR = (OS.device == "iphone" || OS.device == "ipod") && OS.browser == "mobilesafari",
        BARCOMPENSATION = 60,

        WINDOW = $(window),
        HEAD = $("head"),
        proxy = $.proxy;

    function isOrientationHorizontal() {
        return (Math.abs(window.orientation) / 90 == 1);
    }

    function getOrientationClass() {
        return isOrientationHorizontal() ? HORIZONTAL : VERTICAL;
    }

    function applyViewportHeight() {
        $("meta[name=viewport]").replaceWith(viewportTemplate({ height: isOrientationHorizontal() ? ", height=device-width" : ", height=device-height" }));
    }

    /**
    * @name kendo.mobile.Application.Description
    * @section
    *
    * <p>The Kendo mobile <strong>Application</strong> provides the necessary tools for building native-looking web based mobile applications.</p>
    *
    * <h3>Getting Started</h3>
    * <p>The simplest mobile <strong>Application</strong> consists of a single mobile <strong>View</strong>. </p>
    *
    * @exampleTitle Hello World mobile Application
    * @example
    * <body>
    *    <div data-role="view">
    *      <div data-role="header">Header</div>
    *      Hello world!
    *      <div data-role="footer">Footer</div>
    *    </div>
    *
    *    <script>
    *    var app = new kendo.mobile.Application(); //document.body is used by default
    *    </script>
    * </body>
    *
    * @section
    * <h3>Mobile Views</h3>
    *
    * <p>The mobile <strong>Application</strong> consists of a single HTML page with one or more mobile Views, linked with navigational widgets (Buttons, TabStrip, etc.).
    * Each child of the application element (<code>&lt;body&gt;</code> by default) with <code>data-role="view"</code> is considered a mobile view.
    *
    * @section
    *
    * <h3>Navigation</h3>
    * <p>When initialized, the mobile <strong>Application</strong> modifies the kendo mobile widgets' (listview link items, buttons, tabs, etc.) behavior so that they navigate between the mobile views when the user taps them.
    * When targeting local views, The navigation <strong>Widget</strong>'s <code>href</code> attribute specifies the <strong>View</strong> id to navigate to, prefixed with <code>#</code>, like an anchor.</p>
    *
    * @exampleTitle Views linked with mobile Buttons
    * @example
    * <div data-role="view" id="foo">Foo <a href="#bar" data-role="button">Go to Bar</a></div>
    * <div data-role="view" id="bar">Bar <a href="#foo" data-role="button">Go to Foo</a></div>
    *
    * @section
    * <h3>Linking to External Pages</h3>
    * <p>By default, all navigational widgets try to navigate to loacal views when tapped. This behavior can be overridden by setting <code>data-rel="external"</code> attribute to the link element. </p>
    *
    * @exampleTitle External links
    * @example
    * <a href="http://kendoui.com/" data-rel="external">Visit KendoUI</a>
    *
    * @section
    *
    * <h3>View Transitions</h3>
    * <p><strong>View</strong> transitions are defined by setting a <code>data-transition</code> attribute to the <strong>View</strong> DOM element or to the navigational widget <code>A</code> DOM element.
    * If both are present, the navigational widget transition takes precedence.
    * An application-wide default transition may be set using the <code>transition</code> parameter in the options parameter of the <strong>Application</strong> constructor.
    * The following transitions are supported:</p>
    *
    * <h4>slide</h4>
    * <p> This is the default iOS <strong>View</strong> transition. Old <strong>View</strong> content slides to the left and the new <strong>View</strong> content slides in its place.
    * Headers and footers (if present) use the <strong>fade</strong> transition. </p>
    * <p>The transition direction can be specified by using <code>slide:(direction)</code>.
    * Supported directions are <code>left</code> and <code>right</code>. By default, the direction is <code>left</code>.</p>
    *
    * <h4>zoom</h4>
    * <p>The new <strong>View</strong> (along with its header and footer) content zooms from the center of the previous <strong>View</strong>. The old <strong>View</strong> content fades out. Suitable for displaying dialogs.</p>
    *
    * <h4>fade</h4>
    * <p>The new <strong>View</strong> (along with its header and footer) content fades in on top of the previous <strong>View</strong> content.</p>
    *
    * <h4>overlay</h4>
    * <p>The new <strong>View</strong> content slides on top of the previous <strong>View</strong>. Unlike the <code>slide</code> transition,
    * the previous View stays "under" the new one, and the headers / footers do not transition separately. </p>
    * <p>The transition direction can be specified by using <code>overlay:(direction)</code> format.
    * Supported directions are <code>down</code>, <code>left</code>, <code>up</code> and <code>right</code>. By default, the direction is <code>left</code>.</p>
    *
    * @exampleTitle Views with Transitions
    * @example
    * <div data-role="view" id="foo" data-transition="slide">Foo <a href="#bar" data-role="button">Go to Bar</a></div>
    * <div data-role="view" id="bar" data-transition="overlay:up">Bar <a href="#foo" data-role="button">Go to Foo</a></div>
    *
    * @section
    * <p>Each transition may be played in <strong>reverse</strong>. To do so, add <code>" reverse"</code> after the transition definition. For
    * instance, to simulate returning to previous view using slide transition, use <code>"slide:left reverse"</code></p>
    *
    * @exampleTitle Reverse transition
    * @example
    * <div data-role="view" id="foo">Foo <a href="#bar" data-role="button">Go to Bar</a></div>
    * <div data-role="view" id="bar">Bar <a href="#foo" data-role="button" data-transition="slide:left reverse">Go to Foo</a></div>
    *
    * @section
    * <p>When a <strong>View</strong> transitions to the <strong>View</strong> displayed before it (foo → bar → foo), this is considered a <strong>back</strong> navigation.
    * In this case, the animation of the current <strong>View</strong> is applied in reverse.
    * For instance, navigating with slide transition from <code>foo</code> to <code>bar</code>, then back to <code>foo</code>
    * would cause the <code>foo</code> <strong>View</strong> to slide from the right side of the screen. </p>
    *
    * @section
    *
    * <h3>Remote Views</h3>
    *
    * <p>The Kendo mobile <strong>Application</strong> can load <strong>Views</strong> remotely, using AJAX. If the navigational widget href attribute value does not start with a hash (#),
    * the application considers the View to be remote, and issues an AJAX request to the provided URL.
    *
    * The View content (the first element with <code>data-role="view"</code>) is extracted from the AJAX response and appended into the Application DOM element.
    * Once the remote <strong>View</strong> is fetched, no additional round trips to the server occur when the <strong>View</strong> is displayed again. </p>
    *
    * @exampleTitle Remote View
    * @example
    * <!-- foo.html -->
    * <div data-role="view">Foo <a href="bar.html" data-role="button">Go to Bar</a></div>
    *
    * <!-- bar.html -->
    * <div data-role="view">Bar</div>
    *
    * @section
    * <p>The remote view request will also append (but not initialize) any <strong>additional views</strong> found in the AJAX
    * response. <strong>Inline style</strong> elements, <strong>inline script</strong> elements, and <strong>mobile layout</strong> definitions will also be evaluated and appended to the
    * application. The elements must be available in the root of the response, or nested inside the <strong>body</strong> element. </p>
    * <p>Scripts and styles from the <strong>head</strong> element (if present) will <strong>not</strong> be evaluated.</p>
    *
    * <p>If the remote view needs an <b>additional scripting (widget initialization/binding)</b> logic, it may be defined in the view init event handler,  in the AJAX response.</p>
    *
    * @exampleTitle Remote view with init event handler
    * @example
    * <!-- foo.html -->
    * <div data-role="view">
    * <a data-role="button" href="bar.html">Go to bar</a>
    * </div>
    *
    * <!-- bar.html -->
    * <div data-role="view" data-init="initBar">
    *   <a href="#" id="link">Link</a>
    * </div>
    *
    * <script>
    *   function initBar(e) {
    *       e.view.element.find("#link").kendoMobileButton();
    *   }
    * </script>
    *
    * @section
    * <h3> Initial View</h3>
    *
    * <p> The <strong>Application</strong> provides a way to specify the initial view to show. The initial view can be set by
    * passing the view id in the options parameter of the Application's constructor:
    * @exampleTitle Define initial view
    * @example
    * <script>
    *      new kendo.mobile.Application($(document.body), {
    *          initial: "ViewID"
    *      });
    * </script>

    * @section
    *
    * <h3>Web Clip Icons</h3>
    *
    * <p>The mobile devices can create a bookmark with a custom icon, placed on the Home screen. Users can use the shortcut to open that web page later.</p>
    *
    * @exampleTitle Define web clip icon
    * @example
    * <script>
    *      new kendo.mobile.Application($(document.body), {
    *          icon: "URL to a web clip icon"
    *      });
    * </script>
    *
    * @section
    * <p>Multiple icons for different sizes can be defined. Please refer to Apple <a href="https://developer.apple.com/library/ios/#documentation/userexperience/conceptual/mobilehig/IconsImages/IconsImages.html#//apple_ref/doc/uid/TP40006556-CH14-SW11">Web Clip Icons help topic</a>
    * for more information.</p>
    *
    * @exampleTitle Define multiple web clip icons
    * @example
    * <script>
    *      new kendo.mobile.Application($(document.body), {
    *          icon: {
    *            "72x72" : "URL to a 72 x 72 pixels web clip icon",
    *            "114x114" : "URL to a 114 x 114 pixels web clip icon"
    *          }
    *      });
    * </script>
    *
    * @section
    * <h3>Force Platform Styles</h3>
    *
    * <p> The <strong>Application</strong> provides a way to force a specific platform look on your application upon init by
    * passing the OS name in the options parameter of the Application's constructor:
    *
    * @exampleTitle Force iOS look
    * @example
    * <script>
    *      new kendo.mobile.Application($(document.body), {
    *          platform: "ios"
    *      });
    * </script>
    *
    * @section
    * Additionally, the OS version can be specified by by passing kendo.support.mobileOS object that is expected by Kendo UI Mobile.
    * This is more complex, but allows fine grained tuning of the application look and behavior. A sample object initialization is like this:
    *
    * @exampleTitle Force iOS 5 look
    * @example
    * <script>
    *      new kendo.mobile.Application($(document.body), {
    *          platform: {
    *                         device: "ipad",       // Mobile device, can be "ipad", "iphone", "ipod", "android" "fire", "blackberry", "meego"
    *                         name: "ios",          // Mobile OS, can be "ios", "android", "blackberry", "meego"
    *                         ios: true,            // Mobile OS name as a flag
    *                         majorVersion: 5,      // Major OS version
    *                         minorVersion: "0.0",  // Minor OS versions
    *                         flatVersion: "500",   // Flat OS version for easier comparison
    *                         appMode: false        // Whether running in browser or in AppMode/PhoneGap/Titanium.
    *                         tablet: "ipad"        // If a tablet - tablet name or false for a phone.
    *                    }
    *      });
    * </script>
    */
    var Application = kendo.Observable.extend(/** @lends kendo.mobile.Application.prototype */{
        /**
         * @constructs
         * @extends kendo.Observable
         * @param {Element} element DOM element. By default, the body element is used.
         * @param {Object} options Configuration options.
         * @option {String} [layout] <> The id of the default Application Layout.
         * _example
         * <div data-role="view">Bar</div>
         *
         * <div data-role="layout" data-id="foo">
         *   <div data-role="header">Header</div>
         * </div>
         *
         * @option {String} [initial] <> The id of the initial mobilie View to display.
         * _example
         * <script>
         *      new kendo.mobile.Application($(document.body), {
         *          initial: "ViewID"
         *      });
         * </script>
         * @option {String} [loading] <Loading...> The text displayed in the loading popup. Setting this value to false will disable the loading popup.
         * @option {Boolean} [hideAddressBar] <true> Whether to hide the browser address bar.
         * <script>
         *      new kendo.mobile.Application($(document.body), { layout: "foo" });
         * </script>
         * @option {String} [transition] <> The default View transition.
         * _example
         * <script>
         *      new kendo.mobile.Application($(document.body), { transition: "slide" });
         * </script>
         * @option {String} [platform] <> Which platform look to force on the application. Can be one of "ios", "android", "blackberry".
         * _example
         * <script>
         *      new kendo.mobile.Application($(document.body), {
         *          platform: "android"
         *      });
         * </script>
         */
        init: function(element, options) {
            var that = this;

            mobile.application = that; // global reference to current application

            that.options = $.extend({ hideAddressBar: true, transition: "" }, options);
            kendo.Observable.fn.init.call(that, that.options);
            that.element = $(element ? element : document.body);

            $(function(){
                that._setupPlatform();
                that._attachHideBarHandlers();
                that.pane = new Pane(that.element, that.options);
                that._setupElementClass();
                that._attachMeta();
                that._setupDocumentTitle();
                that._startHistory();

                if (support.touch) {
                    $(document.documentElement).on("touchmove", false);
                }
            });
        },

        /**
         * Navigate to local or to remote view.
         * @param {String} url The id or url of the view.
         * @param {String} transition The transition to apply when navigating. See View Transitions section for more
         * information.
         *
         * @exampleTitle Navigate to a remote view
         * @example
         * var app = new kendo.mobile.Application();
         * app.navigate("settings.html");
         *
         * @exampleTitle Navigate to a local view
         * @example
         * <div data-role="view" id="foo"> ... </div>
         *
         * <script>
         * var app = new kendo.mobile.Application();
         * app.navigate("#foo");
         * </script>
         */
        navigate: function(url, transition) {
            this.pane.navigate(url, transition);
        },

        /**
         * Get a reference to the current view's scroller widget instance.
         * @returns {Scroller} the scroller widget instance.
         */
        scroller: function() {
            return this.view().scroller;
        },

        /**
         * Hide the loading animation.
         * @example
         * <script>
         *   var app = new kendo.mobile.Application();
         *   app.hideLoading();
         * </script>
         */
        hideLoading: function() {
            this.pane.hideLoading();
        },

        /**
         * Show the loading animation.
         * @example
         * <script>
         *   var app = new kendo.mobile.Application();
         *   app.showLoading();
         * </script>
         */
        showLoading: function() {
            this.pane.showLoading();
        },

        /**
         * Get a reference to the current view.
         * @returns {View} the view instance.
         */
        view: function() {
            return this.pane.view();
        },

        _setupPlatform: function() {
            var that = this,
                platform = that.options.platform,
                os = OS,
                version;

            if (platform) {
                if (typeof platform === "string") {
                    os = MOBILE_PLATFORMS[platform];
                } else {
                    os = platform;
                }

                support.mobileOS = OS = os;
            }

            if (os) {
                that.os = os.name;
                version = {
                    appMode: os.appMode,
                    major: os.majorVersion,
                    minor: os.minorVersion ? os.minorVersion[0] : 0
                };
            } else {
                that.os = DEFAULT_OS;
                version = false;
            }

            that.osCssClass = OS_NAME_TEMPLATE({ name: "km-" + that.os, version: version });
        },

        _startHistory: function() {
            var that = this,
                historyEvents,
                initial = that.options.initial;

            historyEvents = {
                change: function(e) {
                    that.pane.navigate(e.url);
                },

                ready: function(e) {
                    var url = e.url;

                    if (!url && initial) {
                        url = initial;
                        history.navigate(initial, true);
                    }

                    that.pane.navigate(url);
                }
            };

            that.pane.bind("navigate", function(e) {
                history.navigate(e.url, true);
            });

            history.start($.extend(that.options, historyEvents));
        },

        _setupElementClass: function() {
            var that = this,
                osCssClass = that.options.platform ? "km-" + that.options.platform : that.osCssClass,
                element = that.element;

            element.parent().addClass("km-root km-" + (OS.tablet ? "tablet" : "phone"));
            element.addClass(osCssClass + " " + getOrientationClass());

            if (BERRYPHONEGAP) {
                applyViewportHeight();
            }

            kendo.onResize(function() {
                element.removeClass("km-horizontal km-vertical")
                    .addClass(getOrientationClass());

                if (BERRYPHONEGAP) {
                    applyViewportHeight();
                }
            });
        },

        _attachMeta: function() {
            var icon = this.options.icon, size;

            HEAD.prepend(meta);

            if (icon) {
                if (typeof icon === "string") {
                    icon = { "" : icon };
                }

                for(size in icon) {
                    HEAD.prepend(iconMeta({ icon: icon[size], size: size }));
                }
            }
        },

        _attachHideBarHandlers: function() {
            var that = this,
                hideBar = proxy(that._hideBar, that);

            if (OS.appMode || !that.options.hideAddressBar) {
                return;
            }

            that._initialHeight = {};

            if (HIDEBAR) {
                WINDOW.on("load", hideBar);
                kendo.onResize(hideBar);
                that.element[0].addEventListener(support.mousedown, hideBar, true);
            }
        },

        _setupDocumentTitle: function() {
            var that = this,
                defaultTitle = document.title;

            that.pane.bind("viewShow", function(e) {
                var title = e.view.title;
                document.title = title !== undefined ? title : defaultTitle;
            });
        },

        _hideBar: function() {
            var that = this,
                element = that.element,
                orientation = window.orientation + "",
                initialHeight = that._initialHeight,
                newHeight;

            if (!initialHeight[orientation]) {
                initialHeight[orientation] = WINDOW.height();
            }

            newHeight = initialHeight[orientation] + BARCOMPENSATION;

            if (newHeight != element.height()) {
                element.height(newHeight);
            }

            setTimeout(window.scrollTo, 0, 0, 1);
        }
    });

    kendo.mobile.Application = Application;
})(jQuery);
(function($, undefined) {
    var kendo = window.kendo,
        ui = kendo.mobile.ui,
        Shim = ui.Shim,
        Popup = ui.Popup,
        Widget = ui.Widget,
        OPEN = "open",
        BUTTONS = "li>a",
        CONTEXT_DATA = "actionsheetContext",
        WRAP = '<div class="km-actionsheet-wrapper" />',
        cancelTemplate = kendo.template('<li class="km-actionsheet-cancel"><a href="\\#">#:cancel#</a></li>');

    /**
     * @name kendo.mobile.ui.ActionSheet.Description
     * @section
     * <p>The mobile ActionSheet widget displays a set of choices related to a task the user initiates.</p>
     * <h3>Getting Started</h3>
     * <p>The mobile Application will automatically initialize a mobile ActionSheet widget for every <code>ul</code> element with <code>role</code>
     * data attribute set to <code>actionsheet</code> present in the views/layouts' markup.
     * Alternatively, it can be initialized using jQuery plugin syntax in the containing mobile View <strong>init event handler</strong>.
     * The actionsheet element should contain one or more <code>li</code> elements, each with an <code>a</code> element inside. A 'Cancel' action is automatically added to the bottom of the actions.</p>
     *
     * @exampleTitle Define an ActionSheet with two buttons
     * @example
     * <ul data-role="actionsheet">
     *   <li><a data-action="foo">Foo</a></li>
     *   <li><a data-action="bar">Bar</a></li>
     * </ul>
     *
     * @section
     * <p>In iOS, the ActionSheet slides in from the bottom of the screen; It also acts like a modal dialog - tapping the background does not close it. </p>
     * <p>In Android and Blackberry, the available actions are centered in the middle of the screen, and tapping the background closes it.</p>
     *
     * <h3>ActionSheet in Tablets </h3>
     * <p>If a tablet is detected, the ActionSheet widget will be displayed in a PopOver. The sizing and the direction of the popover may be customized
     * through the <code>popup</code> configuration option.</p>
     *
     * <h3>Opening an ActionSheet</h3>
     * <p>The widget can be open when any mobile navigational widget (listview link item, button, tabstrip, etc.) is tapped.
     * To do so, set <code>data-rel="actionsheet"</code> attribute and a <code>href</code> attribute equal to the ActionSheet's element <code>id</code> (prefixed with <code>#</code>, like an anchor).</p>
     *
     * @exampleTitle Mobile Button opening ActionSheet
     * @example
     * <a data-role="button" data-rel="actionsheet" href="#replyActionSheet">Reply</a>
     * <ul data-role="actionsheet" id="replyActionSheet">
     *   <li><a data-action="foo">Reply</a></li>
     *   <li><a data-action="foo">Reply to All</a></li>
     *   <li><a data-action="bar">Forward</a></li>
     * </ul>
     *
     * @section
     * <h3>Executing Actions</h3>
     * <p>Each link in the ActionSheet should have a <code>data-action</code> attribute set, specifying the callback method to be executed when the user taps it.
     * The callback can be either a function, or a method of a JavaScript object in the global scope.</p>
     *
     * <p>The callback receives a object with two fields: <code>target</code> and (optional) <code>context</code> as a
     * parameter. The <code>target</code> holds a reference to the DOM element which has opened the ActionSheet. The <code>context</code> contains
     * to the optional <code>actionsheet-context</code> data attribute of the opening DOM element.</p>
     *
     * <p>After the callback has been executed, the ActionSheet closes automatically.</p>
     *
     * @exampleTitle Mobile ActionSheet actions and context
     * @example
     * <a id="myButton"
     *  data-role="button"
     *  data-actionsheet-context="1"
     *  data-rel="actionsheet" href="#myActionSheet">Foo...</a>
     *
     * <ul data-role="actionsheet" id="myActionSheet">
     *   <li><a data-action="foo">Foo</a></li>
     *   <li><a data-action="bar.baz">Bar</a></li>
     * </ul>
     * <script>
     *      function foo(e) {
     *          e.context; // 1
     *          e.target; // $("#myButton")
     *      }
     *
     *      var bar = {
     *          baz: function(e) {
     *              e.context; // 1
     *              e.target; // $("#myButton")
     *          }
     *      }
     * </script>
     *
     */
    var ActionSheet = Widget.extend(/** @lends kendo.mobile.ui.ActionSheet.prototype */{
        /**
         * @constructs
         * @extends kendo.mobile.ui.Widget
         * @param {Element} element DOM element.
         * @param {Object} options Configuration options.
         * @option {String} [cancel] <Cancel> The text of the cancel button.
         * @option {Object} [popup] The popup configuration options (tablet only).
         * @option {Number | String} [popup.width] <240> The width of the popup in pixels.
         * @option {Number | String} [popup.height] <auto> The height of the popup in pixels.
         * @option {Number | String} [popup.direction] <down> The direction to which the popup will expand, relative to the target that opened it.
         */
        init: function(element, options) {
            var that = this,
                os = kendo.support.mobileOS,
                ShimClass = os.tablet ? Popup : Shim,
                wrapper;

            Widget.fn.init.call(that, element, options);

            element = that.element;

            element
                .addClass("km-actionsheet")
                .append(cancelTemplate({cancel: that.options.cancel}))
                .wrap(WRAP)
                .on(kendo.support.mouseup, BUTTONS, $.proxy(that._click, that))
                .on("click", BUTTONS, kendo.preventDefault);

            wrapper = element.parent();

            that.wrapper = wrapper;
            that.shim = new ShimClass(that.wrapper, $.extend({modal: !(os.android || os.meego)}, that.options.popup) );

            kendo.notify(that, ui);
        },

        events: [
            /**
             * Fires when the ActionSheet is opened.
             * @name kendo.mobile.ui.ActionSheet#open
             * @event
             * @param {Event} e
             * @param {jQuery} e.target The invocation target of the ActionSheet.
             * @param {jQuery} e.context The defined ActionSheet context.
             */
            OPEN
        ],

        options: {
            name: "ActionSheet",
            cancel: "Cancel",
            popup: { height: "auto" }
        },

        /**
         * Open the ActionSheet.
         * @param {jQuery} target (optional) The target of the ActionSheet, available in the callback methods.
         * @param {Object} context (optional) The context of the ActionSheet, available in the callback methods.
         */
        open: function(target, context) {
            var that = this;
            that.target = $(target);
            that.context = context;
            that.shim.show();
        },


        /**
         * Close the ActionSheet.
         */
        close: function() {
            this.context = this.target = null;
            this.shim.hide();
        },

        /** @ignore */
        openFor: function(target) {
            var that = this;
            that.target = target;
            that.context = target.data(CONTEXT_DATA);
            that.trigger(OPEN, { target: that.target, context: that.context });
            that.shim.show(target);
        },

        _click: function(e) {
            if (e.isDefaultPrevented()) {
                return;
            }

            var action = $(e.currentTarget).data("action");

            if (action) {
                kendo.getter(action)(window)({
                    target: this.target,
                    context: this.context
                });
            }

            e.preventDefault();
            this.close();
        }
    });

    ui.plugin(ActionSheet);
})(jQuery);
(function($, undefined) {
    var kendo = window.kendo,
        mobile = kendo.mobile,
        ui = mobile.ui,
        Widget = ui.Widget,
        support = kendo.support,
        os = support.mobileOS,
        ANDROID3UP = os.android && os.flatVersion >= 300,
        MOUSECANCEL = support.mousecancel,
        MOUSEDOWN = support.mousedown,
        MOUSEMOVE = support.mousemove,
        MOUSEUP = support.mouseup,
        CLICK = "click",
        removeActiveID = 0,
        proxy = $.proxy;

    /**
     * @name kendo.mobile.ui.Button.Description
     * @section
     * <p>The mobile Button widget navigates to mobile View or executes a custom callback when tapped.</p>
     *
     * <h3>Getting Started</h3>
     * <p>The Kendo mobile Application will automatically initialize a mobile Button widget for every element with <code>role</code> data attribute set to <code>button</code> present in the views/layouts' markup.
     * Alternatively, it can be initialized using jQuery plugin syntax in the containing mobile View <strong>init event handler</strong>.
     * The button element may be either <code>A</code> or <code>BUTTON</code>. </p>
     *
     * @exampleTitle Initialize Kendo mobile Button based on role data attribute
     * @example
     * <a href="#foo" data-role="button">Foo</a>
     *
     * @exampleTitle Initialize Kendo mobile Button using jQuery
     * @example
     * var button = $("#button").kendoMobileButton();
     *
     * @section
     *
     * <h3>Customizing Mobile Button Appearance</h3>
     * <p>The Kendo mobile Button color can be customized by setting its <code>background-color</code> CSS property inline or by using a CSS selector with specificity of 20+.
     * You can target platforms separately using their respective root CSS classes.</p>
     *
     * @exampleTitle Green Button
     * @example
     * <a href="#foo" data-role="button" style="background-color: green">Foo</a>
     *
     * @section
     *
     * @exampleTitle Green Kendo mobile Button in iOS and a red one in Android
     * @example
     * <style>
     *     .km-ios .checkout { background-color: green; }
     *     .km-android .checkout { background-color: red; }
     * </style>
     *
     * <a href="#foo" data-role="button" class="checkout">Foo</a>
     *
     * @section
     * <h3>Button icons</h3>
     * <p>A Button icon can be set in two ways - either by adding an <code>img</code> element inside the Button element,
     * or by setting an <code>icon</code> data attribute to the Button element.</p>
     * <p>KendoUI Mobile ships with several ready to use icons:</p>
     *
     * <ul id="icon-list">
     *   <li title=".km-about"><span class="km-icon km-about"></span>about</li>
     *   <li title=".km-action"><span class="km-icon km-action"></span>action</li>
     *   <li title=".km-add"><span class="km-icon km-add"></span>add</li>
     *   <li title=".km-bookmarks"><span class="km-icon km-bookmarks"></span>bookmarks</li>
     *   <li title=".km-camera"><span class="km-icon km-camera"></span>camera</li>
     *   <li title=".km-cart"><span class="km-icon km-cart"></span>cart</li>
     *   <li title=".km-compose"><span class="km-icon km-compose"></span>compose</li>
     *   <li title=".km-contacts"><span class="km-icon km-contacts"></span>contacts</li>
     *   <li title=".km-details"><span class="km-icon km-details"></span>details</li>
     *   <li title=".km-downloads"><span class="km-icon km-downloads"></span>downloads</li>
     *   <li title=".km-fastforward"><span class="km-icon km-fastforward"></span>fastforward</li>
     *   <li title=".km-favorites"><span class="km-icon km-favorites"></span>favorites</li>
     *   <li title=".km-featured"><span class="km-icon km-featured"></span>featured</li>
     *   <li title=".km-featured"><span class="km-icon km-toprated"></span>toprated</li>
     *   <li title=".km-globe"><span class="km-icon km-globe"></span>globe</li>
     *   <li title=".km-history"><span class="km-icon km-history"></span>history</li>
     *   <li title=".km-home"><span class="km-icon km-home"></span>home</li>
     *   <li title=".km-info"><span class="km-icon km-info"></span>info</li>
     *   <li title=".km-more"><span class="km-icon km-more"></span>more</li>
     *   <li title=".km-mostrecent"><span class="km-icon km-mostrecent"></span>mostrecent</li>
     *   <li title=".km-mostviewed"><span class="km-icon km-mostviewed"></span>mostviewed</li>
     *   <li title=".km-organize"><span class="km-icon km-organize"></span>organize</li>
     *   <li title=".km-pause"><span class="km-icon km-pause"></span>pause</li>
     *   <li title=".km-play"><span class="km-icon km-play"></span>play</li>
     *   <li title=".km-recents"><span class="km-icon km-recents"></span>recents</li>
     *   <li title=".km-refresh"><span class="km-icon km-refresh"></span>refresh</li>
     *   <li title=".km-reply"><span class="km-icon km-reply"></span>reply</li>
     *   <li title=".km-rewind"><span class="km-icon km-rewind"></span>rewind</li>
     *   <li title=".km-search"><span class="km-icon km-search"></span>search</li>
     *   <li title=".km-settings"><span class="km-icon km-settings"></span>settings</li>
     *   <li title=".km-share"><span class="km-icon km-share"></span>share</li>
     *   <li title=".km-stop"><span class="km-icon km-stop"></span>stop</li>
     *   <li title=".km-trash"><span class="km-icon km-trash"></span>trash</li>
     * </ul>
     *
     * <p>Additional icons may be added by defining the respective CSS class.
     * If the <code>icon</code> data attribute is set to <code>custom</code>, the tab will receive <code>km-custom</code> CSS class.</p>
     *
     * <h3>Creating Custom Icons</h3>
     *
     * <p>In order to create colorizable icons like the default ones in Kendo UI Mobile, specify the icon image as a <b>box mask</b>
     * (either as dataURI or as a separate image). The image should be <b>PNG8</b> or <b>PNG24</b> with alpha channel (<b>PNG8+Alpha</b> is supported by
     * only few graphic editors, so <b>better stick with PNG24</b>). The image color is not important - it will be used as a mask only.</p>
     *
     * <p><strong>Note</strong>: <strong>BlackBerry 7.0</strong> has a bug that renders its masks as background-image, so it is recommended to use white in order to support it. The bug is fixed in <strong>7.1</strong>.</p>
     *
     * @exampleTitle Define custom button icon
     * @example
     * <style>
     * .km-custom {
     *   -webkit-mask-box-image: url("foo.png");
     * }
     * </style>
     *
     * <div data-role="button">
     *   <a href="#index" data-icon="custom">Home</a>
     * </div>
     */
    var Button = Widget.extend(/** @lends kendo.mobile.ui.Button.prototype */{
        /**
        * @constructs
        * @extends kendo.mobile.ui.Widget
        * @param {Element} element DOM element.
        * @param {Object} options Configuration options.
        * @option {String} [icon] <> The icon of the button. It can be either one of the built-in icons, or a custom one.
        * _example
        * var button = $("#button").kendoMobileButton({ icon: "stop" });
        */
        init: function(element, options) {
            var that = this;

            Widget.fn.init.call(that, element, options);

            that._wrap();
            that._style();

            that._releaseProxy = proxy(that._release, that);
            that._removeProxy = proxy(that._removeActive, that);

            that.element.bind(MOUSEUP, that._releaseProxy);
            that.element.bind(MOUSEDOWN + " " + MOUSECANCEL + " " + MOUSEUP, that._removeProxy);

            if (ANDROID3UP) {
                that.element.bind(MOUSEMOVE, function (e) {
                    if (!removeActiveID) {
                        removeActiveID = setTimeout(that._removeProxy, 500 , e);
                    }
                });
            }
        },

        events: [
        /**
         * Fires when the user taps the button.
         * @name kendo.mobile.ui.Button#click
         * @event
         * @param {Event} e
         * @param {jQuery} e.target The clicked DOM element
         * @param {jQuery} e.button The button DOM element
         */
        CLICK
        ],

        options: {
            name: "Button",
            icon: "",
            style: ""
        },

        _removeActive: function (e) {
            $(e.target).closest(".km-button,.km-detail").toggleClass("km-state-active", e.type == MOUSEDOWN);

            if (ANDROID3UP) {
                clearTimeout(removeActiveID);
                removeActiveID = 0;
            }
        },

        _release: function(e) {
            var that = this;
            if (e.which > 1) {
                return;
            }

            if (that.trigger(CLICK, {target: $(e.target), button: that.element})) {
                e.preventDefault();
            }
        },

        _style: function () {
            var style = this.options.style,
                element = this.element,
                styles;

            if (style) {
                styles = style.split(" ");
                $.each(styles, function () {
                    element.addClass("km-" + this);
                });
            }
        },

        _wrap: function() {
            var that = this,
                icon = that.options.icon,
                iconSpan = '<span class="km-icon km-' + icon,
                element = that.element.addClass("km-button"),
                span = element.children("span:not(.km-icon)").addClass("km-text"),
                image = element.find("img").addClass("km-image");

            if (!span[0] && element.html()) {
                span = element.wrapInner('<span class="km-text" />').children("span.km-text");
            }

            if (!image[0] && icon) {
                if (!span[0]) {
                    iconSpan += " km-notext";
                }
                element.prepend($(iconSpan + '" />'));
            }
        }
    });

    /**
    * @name kendo.mobile.ui.BackButton.Description
    * @section
    * <h2>BackButton</h2>
    * <p>The mobile BackButton widget navigates to the previously visited mobile View when pressed. A view can be explicitly set using the <code>href</code> attribute.</p>
    *
    * @exampleTitle Initialize Kendo mobile BackButton based on role data attribute
    * @example
    * <a data-role="backbutton">Foo</a>
    *
    * @exampleTitle Initialize Kendo mobile BackButton using jQuery plugin syntax
    * @example
    * var button = $("#button").kendoMobileBackButton();
    */
    var BackButton = Button.extend(/** @lends kendo.mobile.ui.BackButton.prototype */{
        options: {
            name: "BackButton",
            style: "back"
        },

        /**
        * @constructs
        * @extends kendo.mobile.ui.Button
        * @param {Element} element DOM element.
        * @param {Object} options Configuration options.
        */
        init: function(element, options) {
            var that = this;
            Button.fn.init.call(that, element, options);

            if (typeof that.element.attr("href") === "undefined") {
                that.element.attr("href", "#:back");
            }
        }
    });

    /**
    * @name kendo.mobile.ui.DetailButton.Description
    * @section
    * <h2>DetailButton</h2>
    *
    * <p>The DetailButton widget navigates to a mobile View when pressed.</p>
    *
    * @exampleTitle Initialize Kendo mobile DetailButton based on role data attribute
    * @example
    * <a data-role="detail-button">Foo</a>
    *
    * @exampleTitle Initialize Kendo mobile DetailButton using jQuery plugin syntax
    * @example
    * var button = $("#button").kendoMobileDetailButton();
    */
    var DetailButton = Button.extend(/** @lends kendo.mobile.ui.DetailButton.prototype */{
        options: {
            name: "DetailButton",
            style: ""
        },

        /**
        * @constructs
        * @extends kendo.mobile.ui.Button
        * @param {Element} element DOM element.
        * @param {Object} options Configuration options.
        */
        init: function(element, options) {
            Button.fn.init.call(this, element, options);
        },

        _style: function () {
            var style = this.options.style + " detail",
                element = this.element;

            if (style) {
                var styles = style.split(" ");
                $.each(styles, function () {
                    element.addClass("km-" + this);
                });
            }
        },

        _wrap: function() {
            var that = this,
                icon = that.options.icon,
                iconSpan = '<span class="km-icon km-' + icon,
                element = that.element,
                span = element.children("span"),
                image = element.find("img").addClass("km-image");

            if (!image[0] && icon) {
                if (!span[0]) {
                    iconSpan += " km-notext";
                }
                element.prepend($(iconSpan + '" />'));
            }
        }

    });

    ui.plugin(Button);
    ui.plugin(BackButton);
    ui.plugin(DetailButton);
})(jQuery);
(function($, undefined) {
    /**
     * @name kendo.mobile.ui.ButtonGroup.Description
     * @section
     * <p>The Kendo mobile ButtonGroup widget presents a linear set of grouped buttons.</p>
     *
     * <h3>Getting Started</h3>
     * <p>The Kendo mobile Application will automatically initialize a mobile ButtonGroup for every element with <code>role</code> data attribute set to <code>buttongroup</code>
     * present in the views/layouts markup. Alternatively, it can be initialized using jQuery plugin syntax in the containing mobile View <strong>init event handler</strong>. The ButtonGroup element should be <code>UL</code> element.</p>
     *
     * @exampleTitle Initialize Kendo mobile ButtonGroup based on role data attribute.
     * @example
     * <ul id="buttongroup" data-role="buttongroup">
     *   <li>Option 1</li>
     *   <li>Option 2</li>
     * </ul>
     *
     * @exampleTitle Initialize Kendo mobile ButtonGroup using jQuery plugin syntax
     * @example
     * var buttongroup = $("#buttongroup").kendoMobileButtonGroup();
     *
     * @section
     *
     * <h3>Customizing Mobile ButtonGroup Appearance</h3>
     *
     * Every Kendo Mobile ButtonGroup color can be customized by setting the respective <code>background-color</code> CSS property inline or with a CSS selector.
     * @exampleTitle Green Kendo mobile ButtonGroup
     * @example
     * <ul id="buttongroup" data-role="buttongroup">
     *   <li style="background-color: green">Option1</li>
     *   <li style="beckground-color: red">Option2</li>
     * </ul>
     *
     * @section
     * <h3>Button Icons</h3>
     * <p>A Button icon can be set in two ways - either by adding an <code>img</code> element inside the Button <code>a</code> element,
     * or by setting an <code>icon</code> data attribute to the Button <code>a</code> element.</p>
     * <p>KendoUI Mobile ships with several ready to use icons:</p>
     *
     * <ul id="icon-list">
     *   <li title=".km-about"><span class="km-icon km-about"></span>about</li>
     *   <li title=".km-action"><span class="km-icon km-action"></span>action</li>
     *   <li title=".km-add"><span class="km-icon km-add"></span>add</li>
     *   <li title=".km-bookmarks"><span class="km-icon km-bookmarks"></span>bookmarks</li>
     *   <li title=".km-camera"><span class="km-icon km-camera"></span>camera</li>
     *   <li title=".km-cart"><span class="km-icon km-cart"></span>cart</li>
     *   <li title=".km-compose"><span class="km-icon km-compose"></span>compose</li>
     *   <li title=".km-contacts"><span class="km-icon km-contacts"></span>contacts</li>
     *   <li title=".km-details"><span class="km-icon km-details"></span>details</li>
     *   <li title=".km-downloads"><span class="km-icon km-downloads"></span>downloads</li>
     *   <li title=".km-fastforward"><span class="km-icon km-fastforward"></span>fastforward</li>
     *   <li title=".km-favorites"><span class="km-icon km-favorites"></span>favorites</li>
     *   <li title=".km-featured"><span class="km-icon km-featured"></span>featured</li>
     *   <li title=".km-featured"><span class="km-icon km-toprated"></span>toprated</li>
     *   <li title=".km-globe"><span class="km-icon km-globe"></span>globe</li>
     *   <li title=".km-history"><span class="km-icon km-history"></span>history</li>
     *   <li title=".km-home"><span class="km-icon km-home"></span>home</li>
     *   <li title=".km-info"><span class="km-icon km-info"></span>info</li>
     *   <li title=".km-more"><span class="km-icon km-more"></span>more</li>
     *   <li title=".km-mostrecent"><span class="km-icon km-mostrecent"></span>mostrecent</li>
     *   <li title=".km-mostviewed"><span class="km-icon km-mostviewed"></span>mostviewed</li>
     *   <li title=".km-organize"><span class="km-icon km-organize"></span>organize</li>
     *   <li title=".km-pause"><span class="km-icon km-pause"></span>pause</li>
     *   <li title=".km-play"><span class="km-icon km-play"></span>play</li>
     *   <li title=".km-recents"><span class="km-icon km-recents"></span>recents</li>
     *   <li title=".km-refresh"><span class="km-icon km-refresh"></span>refresh</li>
     *   <li title=".km-reply"><span class="km-icon km-reply"></span>reply</li>
     *   <li title=".km-rewind"><span class="km-icon km-rewind"></span>rewind</li>
     *   <li title=".km-search"><span class="km-icon km-search"></span>search</li>
     *   <li title=".km-settings"><span class="km-icon km-settings"></span>settings</li>
     *   <li title=".km-share"><span class="km-icon km-share"></span>share</li>
     *   <li title=".km-stop"><span class="km-icon km-stop"></span>stop</li>
     *   <li title=".km-trash"><span class="km-icon km-trash"></span>trash</li>
     * </ul>
     *
     * <h3>Creating Custom Icons</h3>
     *
     * <p>In order to create colorizable icons like the default ones in Kendo UI Mobile, specify the icon image as a <b>box mask</b>
     * (either as dataURI or as a separate image). The image should be <b>PNG8</b> or <b>PNG24</b> with alpha channel (<b>PNG8+Alpha</b> is supported by
     * only few graphic editors, so <b>better stick with PNG24</b>). The image color is not important - it will be used as a mask only.</p>
     *
     * <p><strong>Note</strong>: <strong>BlackBerry 7.0</strong> has a bug that renders its masks as background-image, so it is recommended to use white in order to support it. The bug is fixed in <strong>7.1</strong>.</p>
     *
     * @exampleTitle Define custom button icon
     * @example
     * <style>
     * .km-custom {
     *   -webkit-mask-box-image: url("foo.png");
     * }
     * </style>
     *
     * <ul id="buttongroup" data-role="buttongroup">
     *   <li data-icon="custom">Option 1</li>
     *   <li>Option 2</li>
     * </ul>
     */
    var kendo = window.kendo,
        ui = kendo.mobile.ui,
        Widget = ui.Widget,
        ACTIVE = "km-state-active",
        SELECT = "select",
        SELECTOR = "li:not(." + ACTIVE +")",
        data = kendo.data,
        MOUSEDOWN = kendo.support.touch ? "touchstart" : "mousedown";

    var ButtonGroup = Widget.extend(/** @lends kendo.mobile.ui.ButtonGroup.prototype */{
        /**
         * @constructs
         * @extends kendo.mobile.ui.Widget
         * @param {Element} element DOM element.
         * @param {Object} options Configuration options.
         * @option {Number} [index] Defines the initially selected Button.
         */
        init: function(element, options) {
            var that = this;

            Widget.fn.init.call(that, element, options);

            that.element.addClass("km-buttongroup")
                .delegate(SELECTOR, MOUSEDOWN, $.proxy(that._mousedown, that))
                .find("li").each(that._button);

            that.select(that.options.index);
        },

        events: [
            /**
             * Fires when a Button is selected.
             * @name kendo.mobile.ui.ButtonGroup#select
             * @event
             * @param {Event} e
             *
             * @exampleTitle Handle select event
             * @example
             * <ul id="buttongroup" data-role="buttongroup">
             *   <li>Option 1</li>
             *   <li>Option 2</li>
             * </ul>
             *
             * <script>
             *  $("#buttongroup").data("kendoMobileButtonGroup").bind("select", function(e) {
             *      //handle select event
             *  }
             * </script>
             */
            SELECT
        ],

        options: {
            name: "ButtonGroup",
            index: -1
        },

        /**
         * Get the currently selected Button.
         * @returns {jQuery} the currently selected Button.
         */
        current: function() {
            return this.element.find("." + ACTIVE);
        },

        /**
         * Select a Button.
         * @param {jQuery | Number} li LI element or index of the Button.
         * @example
         * var buttongroup = $("#buttongroup").data("kendoMobileButtonGroup");
         *
         * // selects by jQuery object
         * buttongroup.select(buttongroup.element.children().eq(0));
         *
         * // selects by index
         * buttongroup.select(1);
         */
        select: function (li) {
            var that = this,
                index = -1;

            if (li === undefined || li === -1) {
                return;
            }

            that.current().removeClass(ACTIVE);

            if (typeof li === "number") {
                index = li;
                li = $(that.element[0].children[li]);
            } else if (li.nodeType) {
                li = $(li);
                index = li.index();
            }

            li.addClass(ACTIVE);
            that.selectedIndex = index;
        },

        _button: function() {
            var button = $(this).addClass("km-button"),
                icon = data(button, "icon"),
                span = button.children("span"),
                image = button.find("img").addClass("km-image");

            if (!span[0]) {
                span = button.wrapInner("<span/>").children("span");
            }

            span.addClass("km-text");

            if (!image[0] && icon) {
                button.prepend($('<span class="km-icon km-' + icon + '"/>'));
            }
        },

        _mousedown: function(e) {
            if (e.which > 1) {
                return;
            }

            var that = this;
            that.select(e.currentTarget);
            that.trigger(SELECT);
        }
    });

    ui.plugin(ButtonGroup);
})(jQuery);
(function($, undefined) {
    var kendo = window.kendo,
        Node = window.Node,
        mobile = kendo.mobile,
        ui = mobile.ui,
        support = kendo.support,
        DataSource = kendo.data.DataSource,
        Widget = ui.Widget,
        ITEM_SELECTOR = ".km-list > li",
        HIGHLIGHT_SELECTOR = ".km-list > li > .km-listview-link, .km-list > li > .km-listview-label",
        HANDLED_INPUTS_SELECTOR = ".km-list > li > .km-listview-label > input",
        proxy = $.proxy,
        data = kendo.data,
        GROUP_CLASS = "km-group-title",
        ACTIVE_CLASS = "km-state-active",
        GROUP_WRAPPER = '<div class="' + GROUP_CLASS + '"><div class="km-text"></div></div>',
        GROUP_TEMPLATE = kendo.template('<li><div class="' + GROUP_CLASS + '"><div class="km-text">#= this.headerTemplate(data) #</div></div><ul>#= kendo.render(this.template, data.items)#</ul></li>'),
        WRAPPER = '<div class="km-listview-wrapper" />',

        MOUSEDOWN = support.mousedown,
        MOUSEMOVE = support.mousemove,
        MOUSECANCEL = support.mousecancel,
        MOUSEUP = support.mouseup,

        CLICK = "click",
        REQUEST_START = "requestStart",
        FUNCTION = "function",

        whitespaceRegExp = /^\s+$/,
        buttonRegExp = /button/;

    function toggleItemActiveClass(e) {
        if (e.which > 1) {
            return;
        }

        var clicked = $(e.currentTarget),
            item = clicked.parent(),
            role = data(clicked, "role") || "",
            plainItem = (!role.match(buttonRegExp)),
            prevented = e.isDefaultPrevented();

        if (plainItem) {
            item.toggleClass(ACTIVE_CLASS, e.type === MOUSEDOWN && !prevented);
        }

        if (clicked.is("label") && e.type === MOUSEUP && !prevented) {
            var input = clicked.find("input"),
                type = input.attr("type"),
                value = !input[0].checked;

            if (type === "radio") {
                value = true;
            }

            input[0].checked = value;
        }
    }

    function whitespace() {
        return this.nodeType === Node.TEXT_NODE && this.nodeValue.match(whitespaceRegExp);
    }

    function addIcon(item, icon) {
        if (icon) {
            item.prepend('<span class="km-icon km-' + icon + '"/>');
        }
    }

    function enhanceItem(item) {
        addIcon(item, data(item, "icon"));
    }

    function enhanceLinkItem(item) {
        var parent = item.parent(),
            itemAndDetailButtons = item.add(parent.children(kendo.roleSelector("detailbutton"))),
            otherNodes = parent.contents().not(itemAndDetailButtons).not(whitespace);

        if (otherNodes.length) {
            return;
        }

        item.addClass("km-listview-link")
            .attr(kendo.attr("role"), "listview-link");

        addIcon(item, data(parent, "icon"));
    }

    function enhanceCheckBoxItem(label) {
        if (!label.children("input[type=checkbox],input[type=radio]").length) {
            return;
        }

        var item = label.parent();

        if (item.contents().not(label).not(function() { return this.nodeType == 3; })[0]) {
            return;
        }

        label.addClass("km-listview-label");
    }

    /**
     * @name kendo.mobile.ui.ListView.Description
     * @section
     * <p>The Kendo Mobile ListView widget is used to display flat or grouped list of items.
     * It can be either used in unbound mode by enhancing an HTML <code>ul</code> element, or bound to a DataSource instance.</p>
     *
     * <h3>Getting Started</h3>
     * <p>The Kendo mobile Application automatically initializes the mobile ListView for every <code>ul</code> element with <code>role</code> data attribute set to
     * <code>listview</code> present in the views' markup.
     * Alternatively, it can be initialized using jQuery plugin syntax in the containing mobile View <strong>init event handler</strong>.
     * The mobile ListView element may contain one or more <code>li</code> elements.</p>
     *
     * @exampleTitle Initialize mobile ListView using a role data attribute
     * @example
     * <ul data-role="listview">
     *   <li>Foo</li>
     *   <li>Bar</li>
     * </ul>
     *
     * @exampleTitle Initialize mobile ListView using jQuery plugin syntax
     * @example
     * <div data-role="view" data-init="initListView">
     *  <ul id="listView"></ul>
     * </div>
     *
     * <script>
     * function initListView(e) {
     *  e.view.element.find("#listView").kendoMobileListView();
     * }
     * </script>
     *
     * @section
     * <h3>Inset Mobile ListView</h3>
     * <p>In iOS, the mobile ListView appearance can be changed to <strong>inset</strong>, to achieve an effect similar to iOS grouped table views,
     * where the list items are padded from the container, and have rounded corners.
     * To do so, set the <code>style</code> data attribute to <code>inset</code>.
     * <strong>Note:</strong> This setting won't affect the appearance of the mobile ListView on Android/Blackberry devices.</p>
     *
     * @exampleTitle Create inset mobile ListView
     * @example
     * <ul data-role="listview" data-style="inset">
     *   <li>Foo</li>
     *   <li>Bar</li>
     * </ul>
     *
     * @section
     * <h3>Grouped mobile ListView</h3>
     * <p>The mobile ListView can display items in groups, with optional headers. This can be achieved by nesting unordered lists in items,
     * and setting the widget's element <code>type</code> data attribute to <code>group</code>.</p>
     * @exampleTitle Create grouped mobile ListView
     * @example
     * <ul data-role="listview" data-type="group">
     *     <li>
     *         Foo
     *         <ul>
     *             <li>Bar</li>
     *             <li>Baz</li>
     *         </ul>
     *     </li>
     *     <li>
     *         Bar
     *         <ul>
     *             <li>Bar</li>
     *             <li>Qux</li>
     *         </ul>
     *     </li>
     * </ul>
     *
     * @section
     * <h3>Binding to Data</h3>
     *
     * <p>
     * The mobile ListView can be bound to both local JavaScript arrays and remote data via the
     * <strong>Kendo DataSource component</strong>. Local JavaScript arrays are appropriate for limited value
     * options, while remote data binding is better for larger data sets.
     * </p>
     *
     * @exampleTitle Bind mobile ListView to a local data source.
     * @example
     * function initListView(e) {
     *     e.view.element.find("#listview").kendoMobileListView({
     *         dataSource: kendo.data.DataSource.create(["foo", "bar", "baz"])
     *      });
     * });
     *
     * @section
     * <h3>Customizing Item Templates</h3>
     *
     * <p>The mobile ListView leverages Kendo UI high-performance Templates to provide complete control
     * over item rendering. For a complete overview of Kendo UI Template capabilities and syntax,
     * please review the <a href="http://www.kendoui.com/documentation/framework/templates/" title="Kendo UI Template">Kendo UI Templates</a> documentation.
     * </p>
     *
     * @exampleTitle Basic item template customization
     * @example
     * <ul id="listview"></ul>
     *
     * <script type="text/javascript">
     *     function initListView(e) {
     *         e.view.element.find("#listview").kendoMobileListView({
     *             template : "<strong>#:data.foo#</strong>",
     *             dataSource: kendo.data.DataSource.create([{foo: "bar"}, {foo: "baz"}])
     *         });
     *     });
     * </script>
     *
     * @section
     * <h3>Link Items</h3>
     * <p>The mobile ListView will automatically style items with a single link element inside, adding a details indicator. </p>
     *
     * @exampleTitle ListView with link items
     * @example
     * <ul data-role="listview">
     *   <li><a href="#foo">Foo</a></li>
     *   <li><a href="#bar">Bar</a></li>
     * </ul>
     *
     * @section
     * <h3>Detail Buttons</h3>
     * <p>Mobile ListView integrates with nested DetailButton widgets. These buttons are best suited when the user should be able to execute more than one action on a given row.
     * Detail buttons support 4 default data-styles: <b>contactadd</b>, <b>detaildisclose</b>, <b>rowinsert</b> and <b>rowdelete</b>, along custom icons
     * through the data-icon attribute. One row can contain both regular links and detail buttons.</p>
     *
     * @exampleTitle ListView with Detail Buttons
     * @example
     * <ul data-role="listview" data-style="inset" data-type="group">
     *     <li>
     *         Default button styles
     *         <ul>
     *             <li>Contact Add<a data-role="detailbutton" data-style="contactadd"></a></li>
     *             <li>Detail Disclose<a data-role="detailbutton" data-style="detaildisclose"></a></li>
     *             <li>Row Insert<a data-role="detailbutton" data-style="rowinsert"></a></li>
     *             <li>Row Delete<a data-role="detailbutton" data-style="rowdelete"></a></li>
     *         </ul>
     *     </li>
     *     <li>
     *         Custom icons
     *         <ul>
     *             <li>Battery level<a data-role="detailbutton" data-icon="battery"></a></li>
     *         </ul>
     *     </li>
     *     <li>
     *         Link Items & Detail Buttons
     *         <ul>
     *             <li><a>Row Insert</a><a data-role="detailbutton" data-style="rowinsert"></a></li>
     *             <li><a>Battery Level</a><a data-role="detailbutton" data-icon="battery"></a></li>
     *         </ul>
     *     </li>
     * </ul>
     *
     * @section
     * <h3>Item Icons</h3>
     *
     * <p>An icon can be set in two ways - either by adding an <code>img</code> element inside the <code>li</code> element, or by setting an <code>icon</code> data attribute to the <code>li</code> element.
     * if data attribute is used then an <code>a</code> element should be put in the <code>li</code> element. The icon class will be applied to the <code>a</code> element.
     * Kendo mobile ships with several ready to use icons:</p>
     *
     * <ul id="icon-list">
     *   <li title=".km-about"><span class="km-icon km-about"></span>about</li>
     *   <li title=".km-action"><span class="km-icon km-action"></span>action</li>
     *   <li title=".km-add"><span class="km-icon km-add"></span>add</li>
     *   <li title=".km-bookmarks"><span class="km-icon km-bookmarks"></span>bookmarks</li>
     *   <li title=".km-camera"><span class="km-icon km-camera"></span>camera</li>
     *   <li title=".km-cart"><span class="km-icon km-cart"></span>cart</li>
     *   <li title=".km-compose"><span class="km-icon km-compose"></span>compose</li>
     *   <li title=".km-contacts"><span class="km-icon km-contacts"></span>contacts</li>
     *   <li title=".km-details"><span class="km-icon km-details"></span>details</li>
     *   <li title=".km-downloads"><span class="km-icon km-downloads"></span>downloads</li>
     *   <li title=".km-fastforward"><span class="km-icon km-fastforward"></span>fastforward</li>
     *   <li title=".km-favorites"><span class="km-icon km-favorites"></span>favorites</li>
     *   <li title=".km-featured"><span class="km-icon km-featured"></span>featured</li>
     *   <li title=".km-featured"><span class="km-icon km-toprated"></span>toprated</li>
     *   <li title=".km-globe"><span class="km-icon km-globe"></span>globe</li>
     *   <li title=".km-history"><span class="km-icon km-history"></span>history</li>
     *   <li title=".km-home"><span class="km-icon km-home"></span>home</li>
     *   <li title=".km-info"><span class="km-icon km-info"></span>info</li>
     *   <li title=".km-more"><span class="km-icon km-more"></span>more</li>
     *   <li title=".km-mostrecent"><span class="km-icon km-mostrecent"></span>mostrecent</li>
     *   <li title=".km-mostviewed"><span class="km-icon km-mostviewed"></span>mostviewed</li>
     *   <li title=".km-organize"><span class="km-icon km-organize"></span>organize</li>
     *   <li title=".km-pause"><span class="km-icon km-pause"></span>pause</li>
     *   <li title=".km-play"><span class="km-icon km-play"></span>play</li>
     *   <li title=".km-recents"><span class="km-icon km-recents"></span>recents</li>
     *   <li title=".km-refresh"><span class="km-icon km-refresh"></span>refresh</li>
     *   <li title=".km-reply"><span class="km-icon km-reply"></span>reply</li>
     *   <li title=".km-rewind"><span class="km-icon km-rewind"></span>rewind</li>
     *   <li title=".km-search"><span class="km-icon km-search"></span>search</li>
     *   <li title=".km-settings"><span class="km-icon km-settings"></span>settings</li>
     *   <li title=".km-share"><span class="km-icon km-share"></span>share</li>
     *   <li title=".km-stop"><span class="km-icon km-stop"></span>stop</li>
     *   <li title=".km-trash"><span class="km-icon km-trash"></span>trash</li>
     * </ul>
     *
     * <p>Additional icons may be added by defining the respective CSS class.
     * If the <code>icon</code> data attribute is set to <code>custom</code>, the tab will receive <code>km-custom</code> CSS class.
     *
     * <h3>Creating Custom Icons</h3>
     *
     * <p>In order to create colorizable icons like the default ones in Kendo UI Mobile, specify the icon image as a <b>box mask</b>
     * (either as dataURI or as a separate image). The image should be <b>PNG8</b> or <b>PNG24</b> with alpha channel (<b>PNG8+Alpha</b> is supported by
     * only few graphic editors, so <b>better stick with PNG24</b>). The image color is not important - it will be used as a mask only.</p>
     *
     * <p><strong>Note</strong>: <strong>BlackBerry 7.0</strong> has a bug that renders its masks as background-image, so it is recommended to use white in order to support it. The bug is fixed in <strong>7.1</strong>.</p>
     *
     * @exampleTitle Define custom list item icon
     * @example
     * <style>
     * .km-custom {
     *   -webkit-mask-box-image: url("foo.png");
     * }
     * </style>
     *
     * <ul data-role="listview" data-style="inset">
     *   <li data-icon="custom">
     *      <a>Home</a>
     *   </li>
     *   <li>
     *      Bar
     *   </li>
     * </ul>
     */
    var ListView = Widget.extend(/** @lends kendo.mobile.ui.ListView.prototype */{
        /**
         * @constructs
         * @extends kendo.mobile.ui.Widget
         * @param {Element} element DOM element.
         * @param {Object} options Configuration options.
         * @option {kendo.data.DataSource | Object} [dataSource] Instance of DataSource or the data that the mobile ListView will be bound to.
         * @option {Boolean} [autoBind] <true> Indicates whether the listview will call read on the DataSource initially.
         * @option {String}  [type] The type of the control. Can be either <code>flat</code> (default) or group. Determined automatically in databound mode.
         * @option {String}  [style] The style of the control. Can be either empty string(""), or inset.
         * @option {String}  [template] <#:data#> The item template.
         * @option {String}  [headerTemplate] <#:value#> The header item template (applicable when the type is set to group).
         * @option {Boolean}  [fixedHeaders] <false> If set to true, the group headers will persist their position when the user scrolls through the listview. Applicable only when the type is set to group, or when binding to grouped datasource.
         * @option {Boolean} [pullToRefresh] <false> If set to true, the listview will reload its data when the user pulls the view over the top limit.
         * @option {Boolean} [appendOnRefresh] <false> Used in combination with pullToRefresh. If set to true, newly loaded data will be appended on top when refershing.
         * @option {String}  [pullTemplate] <"Pull to refresh"> The message template displayed when the user pulls the listView. Applicable only when pullToRefresh is set to true.
         * @option {String}  [releaseTemplate] <"Release to refresh"> The message template indicating that pullToRefresh will occur. Applicable only when pullToRefresh is set to true.
         * @option {String}  [refreshTemplate] <"Refreshing"> The message template displayed during the refresh. Applicable only when pullToRefresh is set to true.
         * @option {Boolean} [loadMore] <false> If set to true, a button is rendered at the bottom of the listview, which fetch the next page of data when tapped.
         * @option {String}  [loadMoreText] <"Press to load more"> The text of the rendered load-more button (applies only if loadMore is set to true).
         * @option {Boolean} [endlessScroll] <false> If set to true, the listview gets the next page of data when the user scrolls near the bottom of the view.
         * @option {String}  [scrollTreshold] <30> The distance to the bottom in pixels, after which the listview will start fetching the next page. Applicable only when endlessScroll is set to true.
         */
        init: function(element, options) {
            var that = this;

            Widget.fn.init.call(that, element, options);

            options = that.options;

            that.element
                .on([MOUSEDOWN, MOUSEUP, MOUSEMOVE, MOUSECANCEL].join(" "), HIGHLIGHT_SELECTOR, toggleItemActiveClass)
                .on("click", HANDLED_INPUTS_SELECTOR, function (e) { e.preventDefault(); })
                .on(MOUSEUP, ITEM_SELECTOR, proxy(that._click, that));

            that.element.wrap(WRAPPER);
            that.wrapper = that.element.parent();

            that._footer();

            that._dataSource();

            that._bindScroller();

            that._fixHeaders();

            if (options.dataSource && that.options.autoBind) {
                that.dataSource.fetch();
            } else {
                that._style();
            }

            kendo.notify(that, ui);
        },

        events: [
            /**
             * Fires when item is tapped.
             * @name kendo.mobile.ui.ListView#click
             * @event
             * @param {Event} e
             * @param {jQuery} e.item The selected list item.
             * @param {jQuery} e.target The tapped DOM element.
             * @param {Object} e.dataItem The corresponding dataItem associated with the item (available in databound mode only).
             * Note: The dataItem must be from a non-primitive type (Object).
             * @param {kendo.mobile.ui.Button} e.button The tapped Kendo mobile Button (if present).
             *
             * @exampleTitle Handling button clicks
             * @example
             * <ul data-role="listview" id="foo" data-click="listViewClick">
             *     <li><a data-role="button" data-name="bar">Bar button</a> | <a data-role="button" data-name="baz">Baz button</a></li>
             * </ul>
             *
             * <script>
             *  function listViewClick(e) {
             *      console.log(e.button); // Kendo mobile Button instance
             *  }
             * </script>
             *
             * @exampleTitle Accessing dataItem in event
             * @example
             * <ul id="foo"></ul>
             *
             * <script>
             *  $("#foo").kendoMobileListView({
             *     dataSource: new kendo.data.DataSource({
             *          data:   [{title: "foo"}, {title: "bar"}]
             *     }),
             *
             *     click: function(e) {
             *          console.log(e.dataItem.title);
             *     }
             *  });
             * </script>
             */
            CLICK
        ],

        options: {
            name: "ListView",
            type: "flat",
            fixedHeaders: false,
            template: "#:data#",
            headerTemplate: '<span class="km-text">#:value#</span>',
            appendOnRefresh: false,
            loadMore: false,
            loadMoreText: "Press to load more",
            endlessScroll: false,
            scrollTreshold: 30,
            pullToRefresh: false,
            pullTemplate: "Pull to refresh",
            releaseTemplate: "Release to refresh",
            refreshTemplate: "Refreshing",
            pullOffset: 140,
            style: "",
            autoBind: true
        },

        setOptions: function(options) {
            Widget.fn.setOptions.call(this, options);
        },

        setDataSource: function(dataSource) {
            this.options.dataSource = dataSource;
            this._dataSource();
            if (this.options.autoBind) {
                dataSource.fetch();
            }
        },

        /**
         * Repaints the listview (works only in databound mode).
         * @example
         * // get a reference to the mobile listview widget
         * var listView = $("#listView").data("kendoMobileListView");
         * // refreshes the listview
         * listview.refresh();
         */
        refresh: function(e) {
            e = e || {};

            var that = this,
                element = that.element,
                options = that.options,
                dataSource = that.dataSource,
                view = dataSource.view(),
                loading = that.loading,
                appendMethod = loading ? "append" : "html",
                contents,
                data,
                item;

            if (e.action === "itemchange") {
                data = e.items[0];
                item = $(that.template(data));

                element.find("[data-" + kendo.ns + "uid=" + data.uid + "]").replaceWith(item);

                that.trigger("itemChange", {
                    item: item,
                    data: data,
                    ns: ui
                });

                return;
            }

            if (!that.template) {
                that._templates();
            }

            that.trigger("dataBinding");

            if (dataSource.group()[0]) {
                options.type = "group";
                contents = kendo.render(that.groupTemplate, view);
            } else {
                contents = kendo.render(that.template, view);
            }

             if (options.appendOnRefresh) {
                appendMethod = "prepend";
            }

            element[appendMethod](contents);

            if (loading) {
                that.loading = false;
                that._calcTreshold();

                if (options.loadMore) {
                    that._toggleButton(true);
                } else {
                    that._toggleIcon(false);
                }
            }

            if (options.pullToRefresh) {
                that._scroller().pullHandled();
            }

            mobile.init(element.children());

            that._hideLoading();

            that._shouldFixHeaders();
            that._style();

            that.trigger("dataBound", { ns: ui });
        },

        /**
         * Get the listview DOM element items
         * @returns {jQuery} The listview DOM element items
         */
        items: function() {
            if (this.options.type === "group") {
                return this.element.find(".km-list").children();
            } else {
                return this.element.children();
            }
        },

        _dataSource: function() {
            var that = this,
                options = that.options,
                showLoading = $.proxy(that._showLoading, that);

            if (that.dataSource && that._refreshHandler) {
                that.dataSource.unbind("change", that._refreshHandler)
                               .unbind(REQUEST_START, showLoading);
            } else {
                that._refreshHandler = proxy(that.refresh, that);
            }

            that.dataSource = DataSource.create(options.dataSource)
                                        .bind("change", that._refreshHandler);

            if (!options.pullToRefresh && !options.loadMore && !options.endlessScroll) {
                that.dataSource.bind(REQUEST_START, showLoading);
            }
        },

        _fixHeader: function(e) {
            var i = 0,
                that = this,
                scroller = that._scroller(),
                scrollTop = e.scrollTop,
                headers = that.headers,
                headerPair,
                offset,
                header;

            if (that.fixedHeaders) {
                do {
                    headerPair = headers[i++];
                    if (!headerPair) {
                        header = $("<div />");
                        break;
                    }
                    offset = headerPair.offset;
                    header = headerPair.header;
                } while (offset > scrollTop);

                if (that.currentHeader != i) {
                    scroller.fixedContainer.html(header.clone());
                    that.currentHeader = i;
                }
            }
        },

        _shouldFixHeaders: function() {
            this.fixedHeaders = this.options.type === "group" && this.options.fixedHeaders;
        },

        _cacheHeaders: function() {
            var that = this,
                headers = [];

            if (that.fixedHeaders) {
                that.element.find("." + GROUP_CLASS).each(function(_, header) {
                    header = $(header);
                    headers.unshift({
                        offset: header.position().top,
                        header: header
                    });
                });

                that.headers = headers;
                that._fixHeader({scrollTop: 0});
            }
        },

        _fixHeaders: function() {
            var that = this,
                scroller = that._scroller();

            that._shouldFixHeaders();

            if (scroller) {
                kendo.onResize(function(){
                    that._cacheHeaders();
                });

                scroller.bind("scroll", function(e) {
                    that._fixHeader(e);
                });
            }
        },

        _bindScroller: function() {
            var that = this,
                options = that.options,
                dataSource = that.dataSource,
                scroller = that._scroller();

            if (!scroller) {
                return;
            }

            if (options.pullToRefresh) {
                scroller.setOptions({
                    pullToRefresh: true,
                    pull: function() { dataSource.read(); },
                    pullTemplate: options.pullTemplate,
                    releaseTemplate: options.releaseTemplate,
                    refreshTemplate: options.refreshTemplate
                });
            }

            if (options.endlessScroll) {
                that._scrollHeight = scroller.element.height();

                scroller.setOptions({
                    resize: function() {
                        that._scrollHeight = scroller.element.height();
                        that._calcTreshold();
                    },
                    scroll: function(e) {
                        if (!that.loading && e.scrollTop + that._scrollHeight > that._treshold) {
                            that.loading = true;
                            that._toggleIcon(true);
                            dataSource.next();
                        }
                    }
                });
            }
        },

        _calcTreshold: function() {
            var that = this,
                scroller = that._scroller();

            if (scroller) {
                that._treshold = scroller.scrollHeight() - that.options.scrollTreshold;
            }
        },

        _templates: function() {
            var that = this,
                template = that.options.template,
                headerTemplate = that.options.headerTemplate,
                dataIDAttribute = "",
                templateProxy = {},
                groupTemplateProxy = {};

            if (that.dataSource.group()[0] || that.dataSource.view()[0] instanceof kendo.data.ObservableObject) {
                dataIDAttribute = ' data-uid="#=uid#"';
            }

            if (typeof template === FUNCTION) {
                templateProxy.template = template;
                template = "#=this.template(data)#";
            }

            groupTemplateProxy.template = that.template = $.proxy(kendo.template("<li" + dataIDAttribute + ">" + template + "</li>"), templateProxy);

            if (typeof headerTemplate === FUNCTION) {
                groupTemplateProxy._headerTemplate = headerTemplate;
                headerTemplate = "#=this._headerTemplate(data)#";
            }

            groupTemplateProxy.headerTemplate = kendo.template(headerTemplate);

            that.groupTemplate = $.proxy(GROUP_TEMPLATE, groupTemplateProxy);
        },

        _click: function(e) {
            if (e.which > 1 || e.isDefaultPrevented()) {
                return;
            }

            var that = this,
                dataItem,
                item = $(e.currentTarget),
                target = $(e.target),
                buttonElement = target.closest(kendo.roleSelector("button", "detailbutton", "backbutton")),
                button = kendo.widgetInstance(buttonElement, ui),
                id = item.attr(kendo.attr("uid"));

            if (id) {
                dataItem = that.dataSource.getByUid(id);
            }

            if (that.trigger(CLICK, {target: target, item: item, dataItem: dataItem, button: button})) {
                e.preventDefault();
            }
        },

        _style: function() {
            var that = this,
                options = that.options,
                grouped = options.type === "group",
                element = that.element,
                inset = options.style === "inset";

            element.addClass("km-listview")
                .toggleClass("km-list", !grouped)
                .toggleClass("km-listinset", !grouped && inset)
                .toggleClass("km-listgroup", grouped && !inset)
                .toggleClass("km-listgroupinset", grouped && inset);

            if (grouped) {
                element
                    .children()
                    .children("ul")
                    .addClass("km-list");

                element.children("li").each(function() {
                    var groupHeader = $(this).contents().first();
                    if (!groupHeader.is("ul") && !groupHeader.is("div." + GROUP_CLASS)) {
                        groupHeader.wrap(GROUP_WRAPPER);
                    }
                });
            }

            that._enhanceItems();

            element.closest(".km-content").toggleClass("km-insetcontent", inset); // iOS has white background when the list is not inset.

            that._cacheHeaders();
        },

        _enhanceItems: function() {
            this.items().each(function() {
                var item = $(this),
                    child,
                    enhanced = false;

                item.children().each(function() {
                    child = $(this);
                    if (child.is("a")) {
                        enhanceLinkItem(child);
                        enhanced = true;
                    } else if (child.is("label")) {
                       enhanceCheckBoxItem(child);
                       enhanced = true;
                    }
                });

                if (!enhanced) {
                    enhanceItem(item);
                }
            });
        },

        _footer: function() {
            var that = this,
                options = that.options,
                loadMore = options.loadMore,
                loadWrapper;

            if (loadMore || options.endlessScroll) {
                that._loadIcon = $('<span style="display:none" class="km-icon"></span>');
                loadWrapper = $('<span class="km-load-more"></span>').append(that._loadIcon);

                if (loadMore) {
                    that._loadButton = $('<button class="km-load km-button">' + options.loadMoreText + '</button>')
                                        .click(function() {
                                           that.loading = true;
                                           that._toggleButton(false);
                                           that.dataSource.next();
                                        });

                    loadWrapper.append(that._loadButton);
                }

                that.wrapper.append(loadWrapper);
            }
        },

        _toggleButton: function(toggle) {
            this._loadButton.toggle(toggle);
            this._toggleIcon(!toggle);
        },

        _toggleIcon: function(toggle) {
            var icon = this._loadIcon;

            if (toggle) {
                icon.css("display", "block");
            } else {
                icon.hide();
            }
        },

        _scroller: function() {
            var that = this, view;

            if (!that._scrollerInstance) {
                view = that.view();
                that._scrollerInstance = view && view.scroller;
            }

            return that._scrollerInstance;
        },

        _showLoading: function() {
            var view = this.view();
            if (view) {
                view.loader.show();
            }
        },

        _hideLoading: function() {
            var view = this.view();
            if (view) {
                view.loader.hide();
            }
        }
    });

    ui.plugin(ListView);
})(jQuery);
(function($, undefined) {
    /**
     * @name kendo.mobile.ui.NavBar.Description
     *
     * @section
     *
     * <p>The Kendo mobile NavBar widget is used inside a mobile View or Layout Header element to display an application navigation bar.
     * The mobile NavBar may display the current view title in the center, and optionally some additional left and right aligned widgets (a back button, settings button, etc.).</p>
     *
     * <h3>Getting Started</h3>
     * The Kendo mobile Application will automatically initialize the mobile NavBar for every element with <code>role</code> data attribute set to <code>navbar</code> present in the views/layouts markup.
     * Alternatively, it can be initialized using jQuery plugin syntax in the containing mobile View <strong>init event handler</strong>.
     * @exampleTitle Initialize Kendo mobile NavBar based on role data attribute
     * @example
     * <div data-role="navbar">My View Title</div>
     *
     * @exampleTitle Initialize Kendo mobile NavBar using jQuery plugin syntax
     * @example
     * var navbar = $("#navbar").kendoMobileNavBar();
     * @section <h3>Aligning Widgets Inside the NavBar</h3>
     *
     * <p>After initialization, the mobile NavBar positions its child elements based on the specified <code>align</code> data attribute (either <code>left</code> or <code>right</code>).
     * By default, elements without any align are centered.</p>
     *
     * @exampleTitle Use the <code>align</code> data attribute to specify the elements position inside the NavBar
     * @example
     * <div data-role="navbar">
     *   <a data-role="backbutton" data-align="left">Back</a>
     *   My View Title
     *   <a data-role="button" data-align="right">About</a>
     * </div>
     *
     * @section <h3>Automatically Update NavBar Title Based on Current View's Title</h3>
     *
     * <p>If an element with <code>role</code> data attribute set to <code>view-title</code> is present inside the mobile NavBar,
     * the Kendo mobile Application instance will update its text to the current View's title when changing views.
     * The View title is specified by setting the <code>title</code> data attribute of the View element. </p>
     *
     * <p>This feature is particularly useful if the mobile NavBar is inside a layout.</p>
     *
     * @exampleTitle Use the <code>view-title</code> data attribute to auto-update the mobile NavBar title
     * @example
     * <div data-role="layout" data-id="foo">
     *   <div data-role="header">
     *       <div data-role="navbar">
     *          <span data-role="view-title">My View Title</span>
     *       </div>
     *   </div>
     * </div>
     *
     * <div data-role="view" data-layout="foo" data-title="bar"> ... </div>
     * <div data-role="view" data-layout="foo" data-title="baz"> ... </div>
     *
     * @section <h3>Customizing Mobile NavBar Appearance</h3>
     * <p>The mobile NavBar background color can be customized by setting its background-color CSS property either inline or using a CSS selector with specificity of 20+.
     * Different platforms can be styled separately with their respective root classes. </p>
     *
     * @exampleTitle Green Kendo mobile NavBar
     * @example
     * <div data-role="navbar" style="background-color: green">My View Title</div>
     *
     * @exampleTitle Green Kendo mobile NavBar in iOS and a red one in Android
     * @example
     * <style>
     *     .km-ios .checkout { background-color: green; }
     *     .km-android .checkout { background-color: red; }
     * </style>
     * <div data-role="navbar" class="checkout">My View Title</div>
     */
    var kendo = window.kendo,
        ui = kendo.mobile.ui,
        roleSelector = kendo.roleSelector,
        Widget = ui.Widget;

    function createContainer(align, element) {

        var items = element.find("[" + kendo.attr("align") + "=" + align + "]");

        if (items[0]) {
            element.prepend($('<div class="km-' + align + 'item" />').append(items));
        }
    }

    var NavBar = Widget.extend(/** @lends kendo.mobile.ui.NavBar.prototype */{
        /**
         * @constructs
         * @extends kendo.mobile.ui.Widget
         * @param {Element} element DOM element
         */
        init: function(element, options) {
            var that = this;

            Widget.fn.init.call(that, element, options);

            element = that.element;

            element.addClass("km-navbar").wrapInner($('<div class="km-view-title" />'));
            createContainer("left", element);
            createContainer("right", element);
        },

        options: {
            name: "NavBar"
        },

        /**
         * Update the title element text. The title element is specified by setting the <code>role</code> data attribute to <code>view-title</code>.
         * @param {String} value The text of title
         * @example
         * <div data-role="navbar" id="foo">
         *     <span data-role="view-title"></span>
         * </div>
         *
         * <script>
         *   $("#foo").data("kendoMobileNavBar").title("Foo");
         * </script>
         */
        title: function(value) {
            this.element.find(roleSelector("view-title")).text(value);
        },

        viewShow: function(view) {
            this.title(view.options.title);
        }
    });

    ui.plugin(NavBar);
})(jQuery);
(function($, undefined) {
    var kendo = window.kendo,
        mobile = kendo.mobile,
        ui = mobile.ui,
        proxy = $.proxy,
        Transition = kendo.fx.Transition,
        Pane = kendo.ui.Pane,
        PaneDimensions = kendo.ui.PaneDimensions,
        Widget = ui.Widget,

        // Math
        math = Math,
        abs  = math.abs,
        ceil = math.ceil,
        round = math.round,
        max = math.max,
        min = math.min,
        floor = math.floor,
        CHANGE = "change",
        CURRENT_PAGE_CLASS = "km-current-page";

    /**
    * @name kendo.mobile.ui.ScrollView.Description
    * @section
    * <p>The Kendo Mobile ScrollView widget is used to scroll content wider than the device screen.</p>
    *
    * <h3>Getting Started</h3>
    * <p>The Kendo Mobile Application automatically initializes the Mobile ScrollView for every element with <code>role</code> data attribute set to <code>scrollview</code> present in the views' markup.
    * Alternatively, it can be initialized using jQuery plugin syntax in the containing mobile View <strong>init event handler</strong>.
    *
    * @exampleTitle Initialize mobile ScrollView using a role data attribute.
    * @example
    * <div data-role="scrollview">
    *   Foo
    * </div>
    *
    * @exampleTitle Initialize mobile ScrollView using jQuery plugin syntax.
    * @example
    * <div data-role="view" data-init="initScrollView">
    *   <div id="scrollView">
    *     <div data-role="page">Foo</div>
    *     <div data-role="page">Bar</div>
    *   </div>
    * </div>
    * <script>
    * function initScrollView(e) {
    *   e.view.element.find("#scrollView").kendoMobileScrollView();
    * }
    * </script>
    *
    * @section
    * <h3>Pages</h3>
    * Content pages may be defined in order to display exactly one item per page. Pages are automatically resized
    * when the device is rotated. To define a page, wrap the content in a div with <code>data-role="page"</code> attribute set.
    *
    * @exampleTitle ScrollView with pages
    * @example
    * <div data-role="scrollView">
    *    <div data-role="page">Foo</div>
    *    <div data-role="page">Bar</div>
    * </div>
    */
    var ScrollView = Widget.extend(/** @lends kendo.mobile.ui.ScrollView.prototype */{
        /**
        * @constructs
        * @extends kendo.mobile.ui.Widget
        * @param {Element} element DOM element
        * @param {Object} options
        * @option {Number} [page] <0> The initial page to display.
        * @option {Number} [duration] <300> The milliseconds that take the ScrollView to snap to the current page after released.
        * @option {Number} [velocityThreshold] <0.8> The velocity threshold after which a swipe will navigate to the next page (as opposed to snapping back to the current page).
        * @option {Number} [bounceVelocityThreshold] <1.6> The velocity threshold after which a swipe will result in a bounce effect.
        */
        init: function(element, options) {
            var that = this;

            Widget.fn.init.call(that, element, options);

            element = that.element;

            element
                .wrapInner("<div/>")
                .addClass("km-scrollview")
                .append('<ol class="km-pages"/>');

            that.inner = element.children().first();
            that.pager = element.children().last();
            that.page = 0;

            var movable,
                transition,
                drag,
                dimensions,
                dimension,
                pane;

            movable = new kendo.ui.Movable(that.inner);

            transition = new Transition({
                axis: "x",
                movable: movable,
                onEnd: proxy(that._transitionEnd, that)
            });

            drag = new kendo.Drag(element, {
                start: function() {
                    if (abs(drag.x.velocity) * 2 >= abs(drag.y.velocity)) {
                        drag.capture();
                    } else {
                        drag.cancel();
                    }

                    transition.cancel();
                },
                end: proxy(that._dragEnd, that)
            });

            dimensions = new PaneDimensions({
                element: that.inner,
                container: that.element
            });

            dimension = dimensions.x;
            dimension.bind("change", proxy(that.refresh, that));

            pane = new Pane({
                dimensions: dimensions,
                drag: drag,
                movable: movable,
                elastic: true
            });

            $.extend(that, {
                movable: movable,
                transition: transition,
                drag: drag,
                dimensions: dimensions,
                dimension: dimension,
                pane: pane
            });

            that.page = that.options.page;
        },

        options: {
            name: "ScrollView",
            page: 0,
            duration: 300,
            velocityThreshold: 0.8,
            bounceVelocityThreshold: 1.6
        },

        events: [
            /**
             * Fires when the widget page is changed.
             * @name kendo.mobile.ui.ScrollView#change
             * @event
             * @param {Event} e
             * @param {jQuery} e.page The current page (zero based index)
             */
            CHANGE
        ],

        viewShow: function(view) {
            this.dimensions.refresh();
        },

        /**
         * Redraw the mobile ScrollView pager. Called automatically on device orientation change event.
         *
         * @example
         * <div data-role="scrollview" id="scrollview"></div>
         *
         * <script>
         *    $("#scrollview").data("kendoMobileScrollView").refresh();
         * </script>
         */
        refresh: function() {
            var that = this,
                pageHTML = "",
                dimension = that.dimension,
                width = dimension.getSize(),
                pages;

            that.element.find("[data-role=page]").width(width);
            dimension.update(true);

            that.page = Math.floor((-that.movable.x) / width);
            that.scrollTo(that.page);

            pages = that.pages = ceil(dimension.getTotal() / width);

            that.minSnap = - (pages - 1) * width;
            that.maxSnap = 0;

            for (var idx = 0; idx < pages; idx ++) {
                pageHTML += "<li/>";
            }

            that.pager.html(pageHTML);
            that._updatePager();
        },

        /**
         * Update the scrollview HTML content
         * @param {String | jQuery} content the new scrollView content.
         *
         * @example
         * <div data-role="scrollview" id="scrollview"></div>
         *
         * <script>
         *    $("#scrollview").data("kendoMobileScrollView").content("<span>Foo</span>");
         * </script>
         */
        content: function(html) {
           this.element.children().first().html(html);
           this.dimensions.refresh();
        },

        /**
         * Scroll to the given page. Pages are zero-based indexed.
         * @param {Number} page The page to scroll to.
         * @example
         * <div data-role="scrollview" id="scrollview"></div>
         *
         * <script>
         *    // Scroll to the second page of the scrollView
         *    $("#scrollview").data("kendoMobileScrollView").scrollTo(1);
         * </script>
         */
        scrollTo: function(page) {
            this.page = page;
            this._moveTo(- page * this.dimension.getSize(), Transition.easeOutExpo);
        },

        _moveTo: function(location, ease) {
            this.transition.moveTo({ location: location, duration: this.options.duration, ease: ease });
        },

        _dragEnd: function(e) {
            var that = this,
                velocity = e.x.velocity,
                width = that.dimension.size,
                options = that.options,
                velocityThreshold = options.velocityThreshold,
                snap,
                approx = round,
                ease = Transition.easeOutExpo;

            if (velocity > velocityThreshold) {
                approx = ceil;
            } else if(velocity < -velocityThreshold) {
                approx = floor;
            }

            if (abs(velocity) > options.bounceVelocityThreshold) {
                ease = Transition.easeOutBack;
            }

            snap = max(that.minSnap, min(approx(that.movable.x / width) * width, that.maxSnap));

            this._moveTo(snap, ease);
        },

        _transitionEnd:  function() {
            var that = this,
                page = Math.round(- that.movable.x / that.dimension.size);

            if (page != that.page) {
                that.page = page;
                that.trigger(CHANGE, {page: page});
                that._updatePager();
            }
        },

        _updatePager: function() {
            this.pager.children().removeClass(CURRENT_PAGE_CLASS).eq(this.page).addClass(CURRENT_PAGE_CLASS);
        }
    });

    ui.plugin(ScrollView);
})(jQuery);
(function($, undefined) {
    /**
    * @name kendo.mobile.ui.Switch.Description
    *
    * @section
    * <p>The mobile Switch widget is used to display two exclusive choices.</p>
    * <p>When initialized, it shows the currently selected value. User slides the control to reveal the second value.
    * The mobile Switch can be created from <code>input</code> element of type <code>checkbox</code>.</p>
    *
    * <h3>Getting Started</h3>
    *
    * <p> The Kendo Mobile Application will automatically initialize a mobile Switch for every element with <code>role</code> data attribute set to <code>swtich</code> present in the views/layouts markup.
    * Alternatively, it can be initialized using jQuery plugin syntax in the containing mobile View <strong>init event handler</strong>.
    *
    * @exampleTitle Initialize mobile Switch based on role data attribute
    * @example
    * <input type="checkbox" data-role="switch" />
    *
    * @exampleTitle Initialize mobile Switch using jQuery plugin syntax
    * @example
    * <input type="checkbox" id="switch" />
    * <script>
    * var switchWidget = $("#switch").kendoMobileSwitch();
    * </script>
    * @section <h3>Checking/Unchecking the Mobile Switch</h3>
    *
    * <p>The checked state of the mobile Switch depends on the <code>checked</code> property of the widget's constructor options
    * or the <code>checked</code> attribute of the widget's element.</p>
    *
    * @exampleTitle Initialize Kendo mobile Switch from checked <code>input</code>
    * @example
    * <input type="checkbox" id="switch" checked="checked" />
    * <script>
    * var switchWidget = $("#switch").kendoMobileSwitch();
    * </script>
    *
    * @exampleTitle Initialize checked mobile Switch using jQuery plugin syntax
    * @example
    * <input type="checkbox" id="switch" />
    * <script>
    * var switchWidget = $("#switch").kendoMobileSwitch({ checked: true });
    * </script>
    *
    * @section <h3>Specifying the Text of the Labels</h3>
    *
    * @exampleTitle Customize Kendo mobile Switch on/off labels
    * @example
    * <input type="checkbox" id="switch" />
    * <script>
    * var switchWidget = $("#switch").kendoMobileSwitch({ onLabel: "YES", offLabel: "NO" });
    * </script>
    */
    var kendo = window.kendo,
        ui = kendo.mobile.ui,
        Widget = ui.Widget,
        support = kendo.support,
        CHANGE = "change",
        SWITCHON = "km-switch-on",
        SWITCHOFF = "km-switch-off",
        MARGINLEFT = "margin-left",
        ACTIVE_STATE = "km-state-active",
        TRANSFORMSTYLE = support.transitions.css + "transform",
        proxy = $.proxy;

    function limitValue(value, minLimit, maxLimit) {
        return Math.max(minLimit, Math.min(maxLimit, value));
    }

    var Switch = Widget.extend(/** @lends kendo.mobile.ui.Switch.prototype */{
        /**
        * @constructs
        * @extends kendo.mobile.ui.Widget
        * @param {Element} element DOM element.
        * @param {Object} options Configuration options.
        * @option {Boolean} [checked] <false> The checked state of the widget.
        * @option {String} [onLabel] <ON> The ON label.
        * @option {String} [offLabel] <OFF> The OFF label.
        */
        init: function(element, options) {
            var that = this, width, checked, handleWidth;

            Widget.fn.init.call(that, element, options);

            that._wrapper();
            that._drag();
            that._background();
            that._handle();

            element = that.element.data(kendo.attr("role"), "switch");
            element[0].type = "checkbox";

            width = that.wrapper.width();
            handleWidth = that.handle.outerWidth(true);

            that.constrain = width - handleWidth;
            that.snapPoint = width / 2 - handleWidth / 2;
            that._animateBackground = true;

            checked = that.options.checked;
            if (checked === null) {
                checked = element[0].checked;
            }

            that.check(checked);
            kendo.notify(that, kendo.mobile.ui);
        },

        events: [
            /**
            * Fires when the state of the widget changes
            * @name kendo.mobile.ui.Switch#change
            * @event
            * @param {Event} e
            * @param {Object} e.checked The checked state of the widget.
            *
            * @exampleTitle Handle mobile Switch change event
            * @example
            * <input type="checkbox" id="switch" data-role="switch" />
            *
            * <script>
            *  $("#switch").data("kendoMobileSwitch").bind("change", function(e) {
            *      console.log(e.checked); // true or false
            *  }
            * </script>
            */
            CHANGE
        ],

        options: {
            name: "Switch",
            onLabel: "ON",
            offLabel: "OFF",
            checked: null
        },

        /**
        * Get/Set the checked state of the widget.
        * @param {Boolean} check Whether to turn the widget on or off.
        * @returns {Boolean} The checked state of the widget.
        * @example
        * <input data-role="switch" id="foo" />;
        *
        * <script>
        *   // get a reference to the switch widget
        *   var switch = $("#foo").data("kendoMobileSwitch");
        *
        *   // get the checked state of the switch.
        *   var checked = switch.check();
        *
        *   // set the checked state of the switch.
        *   switch.check(true);
        * </script>
        */
        check: function(check) {
            var that = this,
                element = that.element[0];

            if (check === undefined) {
                return element.checked;
            }

            that._position(check ? that.constrain : 0);
            element.checked = check;
            that.wrapper
                .toggleClass(SWITCHON, check)
                .toggleClass(SWITCHOFF, !check);
        },

        /**
        * Toggle the checked state of the widget.
        * @example
        * <input data-role="switch" id="foo" />;
        *
        * <script>
        *   // get a reference to the switch
        *   var switch = $("#foo").data("kendoMobileSwitch");
        *
        *   // toggle the checked state of the switch.
        *   switch.toggle();
        * </script>
        */
        toggle: function() {
            var that = this;

            that.check(!that.element[0].checked);
        },

        _move: function(e) {
            var that = this;
            e.preventDefault();
            that._position(limitValue(that.position + e.x.delta, 0, that.constrain));
        },

        _position: function(position) {
            var that = this;

            that.position = position;
            that.handle.css(TRANSFORMSTYLE, "translatex(" + position + "px)");

            if (that._animateBackground) {
                that.background.css(MARGINLEFT, that.origin + position);
            }
        },

        _start: function(e) {
            this.drag.capture();
            this.handle.addClass(ACTIVE_STATE);
        },

        _stop: function(e) {
            var that = this;

            that.handle.removeClass(ACTIVE_STATE);
            that._toggle(that.position > that.snapPoint);
        },

        _toggle: function (checked) {
            var that = this,
                handle = that.handle,
                element = that.element[0],
                value = element.checked,
                duration = 200,
                distance;

            that.wrapper
                .toggleClass(SWITCHON, checked)
                .toggleClass(SWITCHOFF, !checked);

            that.position = distance = checked * that.constrain;

            if (that._animateBackground) {
                that.background
                    .kendoStop(true, true)
                    .kendoAnimate({ effects: "slideMargin", offset: distance, reset: true, reverse: !checked, axis: "left", duration: duration, ease: "linear" });
            }

            handle
                .kendoStop(true, true)
                .kendoAnimate({
                    effects: "slideTo",
                    duration: duration,
                    offset: distance + "px,0",
                    reset: true,
                    complete: function () {
                        if (value !== checked) {
                            element.checked = checked;
                            that.trigger(CHANGE, { checked: checked });
                        }
                    }
                });
        },

        _background: function() {
            var that = this,
                background;

            background = $("<span class='km-switch-wrapper'><span class='km-switch-background'></span></span>")
                            .appendTo(that.wrapper)
                            .children(".km-switch-background");

            that.origin = parseInt(background.css(MARGINLEFT), 10);
            background.data("origin", that.origin);
            that.background = background;
        },

        _handle: function() {
            var that = this,
                options = that.options;

            that.handle = $("<span class='km-switch-container'><span class='km-switch-handle' /></span>")
                            .appendTo(that.wrapper)
                            .children(".km-switch-handle");

            that.handle.append('<span class="km-switch-label-on">' + options.onLabel + '</span><span class="km-switch-label-off">' + options.offLabel + '</span>');
        },

        _wrapper: function() {
            var that = this,
                element = that.element,
                wrapper = element.parent("span.km-switch");

            if (!wrapper[0]) {
                wrapper = element.wrap('<span class="km-switch"/>').parent();
            }

            that.wrapper = wrapper;
        },

        _drag: function() {
            var that = this;

            that.drag = new kendo.Drag(that.wrapper, {
                tap: function() {
                    that._toggle(!that.element[0].checked);
                },
                start: proxy(that._start, that),
                move: proxy(that._move, that),
                end: proxy(that._stop, that)
            });
        }
    });

    ui.plugin(Switch);
})(jQuery);
(function($, undefined) {
    /**
     * @name kendo.mobile.ui.TabStrip.Description
     * @section
     *
     * <p>The mobile TabStrip widget is used inside a mobile view or layout footer element to display an application-wide group of navigation buttons.
     * The look of the mobile TabStrip changes depending on the user mobile device and operating system.</p>
     *
     * <h3>Getting Started</h3>
     * <p>The Kendo mobile Application will automatically initialize the mobile TabStrip for every element with <code>role</code> data attribute set to <code>tabstrip</code> present in the views/layouts markup.
     * Alternatively, it can be initialized using jQuery plugin syntax in the mobile View/Layout init event handler. The tabstrip element should contain one or more <code>a</code> elements.</p>
     *
     * <h3>Kendo Mobile Application Integration</h3>
     * <p>The tabs of the TabStrip navigate to the mobile application's views. When the mobile application navigates to another view, it updates the TabStrip's currently selected tab, based on the current view's URL.</p>
     *
     * @exampleTitle Initialize Kendo mobile TabStrip based on role data attribute.
     * @example
     * <div data-role="tabstrip">
     *   <a href="#index">Home</a>
     *   <a href="#featured">Featured</a>
     * </div>
     *
     * @section
     * <h3>Tab icons</h3>
     * <p> A tab icon can be set in two ways - either by adding an <code>img</code> element inside the <code>a</code> element, or by setting an <code>icon</code> data attribute to the <code>a</code> element.
     * Kendo mobile TabStrip ships with several ready to use icons:</p>
     *
     * <ul id="icon-list">
     *   <li title=".km-about"><span class="km-icon km-about"></span>about</li>
     *   <li title=".km-action"><span class="km-icon km-action"></span>action</li>
     *   <li title=".km-add"><span class="km-icon km-add"></span>add</li>
     *   <li title=".km-bookmarks"><span class="km-icon km-bookmarks"></span>bookmarks</li>
     *   <li title=".km-camera"><span class="km-icon km-camera"></span>camera</li>
     *   <li title=".km-cart"><span class="km-icon km-cart"></span>cart</li>
     *   <li title=".km-compose"><span class="km-icon km-compose"></span>compose</li>
     *   <li title=".km-contacts"><span class="km-icon km-contacts"></span>contacts</li>
     *   <li title=".km-details"><span class="km-icon km-details"></span>details</li>
     *   <li title=".km-downloads"><span class="km-icon km-downloads"></span>downloads</li>
     *   <li title=".km-fastforward"><span class="km-icon km-fastforward"></span>fastforward</li>
     *   <li title=".km-favorites"><span class="km-icon km-favorites"></span>favorites</li>
     *   <li title=".km-featured"><span class="km-icon km-featured"></span>featured</li>
     *   <li title=".km-featured"><span class="km-icon km-toprated"></span>toprated</li>
     *   <li title=".km-globe"><span class="km-icon km-globe"></span>globe</li>
     *   <li title=".km-history"><span class="km-icon km-history"></span>history</li>
     *   <li title=".km-home"><span class="km-icon km-home"></span>home</li>
     *   <li title=".km-info"><span class="km-icon km-info"></span>info</li>
     *   <li title=".km-more"><span class="km-icon km-more"></span>more</li>
     *   <li title=".km-mostrecent"><span class="km-icon km-mostrecent"></span>mostrecent</li>
     *   <li title=".km-mostviewed"><span class="km-icon km-mostviewed"></span>mostviewed</li>
     *   <li title=".km-organize"><span class="km-icon km-organize"></span>organize</li>
     *   <li title=".km-pause"><span class="km-icon km-pause"></span>pause</li>
     *   <li title=".km-play"><span class="km-icon km-play"></span>play</li>
     *   <li title=".km-recents"><span class="km-icon km-recents"></span>recents</li>
     *   <li title=".km-refresh"><span class="km-icon km-refresh"></span>refresh</li>
     *   <li title=".km-reply"><span class="km-icon km-reply"></span>reply</li>
     *   <li title=".km-rewind"><span class="km-icon km-rewind"></span>rewind</li>
     *   <li title=".km-search"><span class="km-icon km-search"></span>search</li>
     *   <li title=".km-settings"><span class="km-icon km-settings"></span>settings</li>
     *   <li title=".km-share"><span class="km-icon km-share"></span>share</li>
     *   <li title=".km-stop"><span class="km-icon km-stop"></span>stop</li>
     *   <li title=".km-trash"><span class="km-icon km-trash"></span>trash</li>
     * </ul>
     *
     * <p>Additional icons may be added by defining the respective CSS tab class.</p>
     *
     * <h3>Creating Custom Icons</h3>
     *
     * <p>In order to create colorizable icons like the default ones in Kendo UI Mobile, specify the icon image as a <b>box mask</b>
     * (either as dataURI or as a separate image). The image should be <b>PNG8</b> or <b>PNG24</b> with alpha channel (<b>PNG8+Alpha</b> is supported by
     * only few graphic editors, so <b>better stick with PNG24</b>). The image color is not important - it will be used as a mask only.</p>
     *
     * <p><strong>Note</strong>: <strong>BlackBerry 7.0</strong> has a bug that renders its masks as background-image, so it is recommended to use white in order to support it. The bug is fixed in <strong>7.1</strong>.</p>
     *
     * @exampleTitle Define custom tab icon
     * @example
     * <style>
     * .km-custom {
     *   -webkit-mask-box-image: url("foo.png");
     * }
     * </style>
     *
     * <div data-role="tabstrip">
     *   <a href="#index" data-icon="custom">Home</a>
     * </div>
     */
    var kendo = window.kendo,
        ui = kendo.mobile.ui,
        Widget = ui.Widget,
        support = kendo.support,
        ACTIVE_STATE_CLASS = "km-state-active",
        SELECT = "select",
        proxy = $.proxy;

    var TabStrip = Widget.extend(/** @lends kendo.mobile.ui.TabStrip.prototype */{
        /**
         * @constructs
         * @extends kendo.ui.Widget
         * @param {Element} element DOM element.
         * @param {Object} options Configuration options.
         * @option {Number} [selectedIndex] <0> The index of the initially selected tab.
         */
        init: function(element, options) {
            var that = this;

            Widget.fn.init.call(that, element, options);

            that.element.addClass("km-tabstrip");

            that._releaseProxy = proxy(that._release, that);

            that.element.find("a")
                            .each(that._buildButton)
                            .bind(support.mousedown, that._releaseProxy)
                            .eq(that.options.selectedIndex).addClass(ACTIVE_STATE_CLASS);
        },

        events: [
            /**
             * Fires when tab is selected.
             * @name kendo.mobile.ui.TabStrip#select
             * @event
             * @param {Event} e
             * @param {jQuery} e.item The selected tab
             */
            SELECT
        ],

        /**
         * Set the mobile TabStrip active tab to the tab with the specified url.
         * @param {String} url The url of the tab.
         *
         * @example
         * <div data-role="tabstrip" id="tabstrip"> <a href="#foo">Foo</a> </div>
         *
         * <script>
         *     $(function() {
         *         $("#tabstrip").data("kendoMobileTabStrip").switchTo("#foo");
         *     });
         * </script>
         */
        switchTo: function(url) {
            this._setActiveItem(this.element.find('a[href$="' + url + '"]'));
        },

        /**
         * Get the currently selected tab DOM element.
         * @returns {jQuery} the currently selected tab DOM element.
         */
        currentItem: function() {
            return this.element.children("." + ACTIVE_STATE_CLASS);
        },

        _release: function(e) {
            if (e.which > 1) {
                return;
            }

            var that = this,
                item = $(e.currentTarget);

            if (item[0] === that.currentItem()[0]) {
                return;
            }

            if (that.trigger(SELECT, {item: item})) {
                e.preventDefault();
            } else {
                that._setActiveItem(item);
            }
        },

        _setActiveItem: function(item) {
            if (!item[0]) {
                return;
            }
            this.currentItem().removeClass(ACTIVE_STATE_CLASS);
            item.addClass(ACTIVE_STATE_CLASS);
        },

        _buildButton: function() {
            var button = $(this),
                icon = kendo.data(button, "icon"),
                image = button.find("img"),
                iconSpan = $('<span class="km-icon"/>');

            button
                .addClass("km-button")
                .attr(kendo.attr("role"), "tab")
                    .contents().not(image)
                    .wrapAll('<span class="km-text"/>');

            if (image[0]) {
                image.addClass("km-image");
            } else {
                button.prepend(iconSpan);
                if (icon) {
                    iconSpan.addClass("km-" + icon);
                }
            }
        },

        viewShow: function(view) {
            var that = this;
            that.switchTo(view.id);
        },

        options: {
            name: "TabStrip",
            selectedIndex: 0,
            enable: true
        }
    });

    ui.plugin(TabStrip);
})(jQuery);
