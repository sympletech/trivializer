/*
* Kendo UI Mobile v2012.2.710 (http://kendoui.com)
* Copyright 2012 Telerik AD. All rights reserved.
*
* Kendo UI Mobile commercial licenses may be obtained at http://kendoui.com/mobile-license
* If you do not own a commercial license, this file shall be governed by the trial license terms.
*/

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
;