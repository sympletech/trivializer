/*
* Kendo UI Mobile v2012.2.710 (http://kendoui.com)
* Copyright 2012 Telerik AD. All rights reserved.
*
* Kendo UI Mobile commercial licenses may be obtained at http://kendoui.com/mobile-license
* If you do not own a commercial license, this file shall be governed by the trial license terms.
*/
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
;