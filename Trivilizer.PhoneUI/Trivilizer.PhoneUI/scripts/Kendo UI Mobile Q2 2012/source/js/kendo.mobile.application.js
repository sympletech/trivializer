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
;