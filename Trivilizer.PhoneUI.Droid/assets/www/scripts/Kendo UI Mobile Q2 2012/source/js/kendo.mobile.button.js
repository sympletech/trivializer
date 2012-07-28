/*
* Kendo UI Mobile v2012.2.710 (http://kendoui.com)
* Copyright 2012 Telerik AD. All rights reserved.
*
* Kendo UI Mobile commercial licenses may be obtained at http://kendoui.com/mobile-license
* If you do not own a commercial license, this file shall be governed by the trial license terms.
*/
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
;