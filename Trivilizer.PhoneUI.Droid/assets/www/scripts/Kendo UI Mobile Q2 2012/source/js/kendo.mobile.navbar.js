/*
* Kendo UI Mobile v2012.2.710 (http://kendoui.com)
* Copyright 2012 Telerik AD. All rights reserved.
*
* Kendo UI Mobile commercial licenses may be obtained at http://kendoui.com/mobile-license
* If you do not own a commercial license, this file shall be governed by the trial license terms.
*/
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
;