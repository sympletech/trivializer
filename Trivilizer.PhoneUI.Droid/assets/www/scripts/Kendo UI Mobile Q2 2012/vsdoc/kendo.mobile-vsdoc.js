var kendo = {
    ui: {},
    mobile: { ui: {}},
    dataviz: {ui: {}}
};








kendo = {};






kendo.Drag = function() { };

kendo.Drag.prototype = {



    
    
    
    cancel: function() {
        /// <summary>
        /// Discard the current drag. Calling the `cancel` method will trigger the `cancel` event.
/// The correct moment to call this method would be in the `start` event handler.
        /// </summary>



        },

    
    
    
    capture: function() {
        /// <summary>
        /// Capture the current drag, so that Drag listeners bound to parent elements will not trigger.
/// This method will not have any effect if the current drag instance is instantiated with the `global` option set to true.
        /// </summary>



        },


    
    bind: function(event, callback) {
        /// <summary>
        /// Binds to a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be executed when the event is triggered.</param>
    },
    

    
    unbind: function(event, callback) {
        /// <summary>
        /// Unbinds a callback from a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be removed.</param>
    }
    

};

$.fn.getKendoDrag = function() {
    /// <summary>
    /// Returns a reference to the kendo.Drag widget, instantiated on the selector.
    /// </summary>
    /// <returns type="kendo.Drag">The kendo.Drag instance (if present).</returns>
};

$.fn.kendoDrag = function(options) {
    /// <summary>
    /// Instantiates a kendo.Drag widget based the DOM elements that match the selector.
    
    /// &#10;Accepts an object with the following configuration options:
    /// &#10;
    /// &#10;allowSelection — Boolean (default: false)
    ///&#10;If set to true, the mousedown and selectstart events will not be prevented.
    ///&#10;
    /// &#10;filter — Selector undefined
    ///&#10;If passed, the filter limits the child elements that will trigger the event sequence.
    ///&#10;
    /// &#10;global — Boolean (default: false)
    ///&#10;If set to true, the drag event will be tracked beyond the element boundaries.
    ///&#10;
    /// &#10;stopPropagation — Boolean (default: false)
    ///&#10;If set to true, the mousedown event propagation will stopped, disabling
/// &#10;drag capturing at parent elements.
/// &#10;If set to false, dragging outside of the element boundaries will trigger the `end` event.
    ///&#10;
    /// &#10;surface — Element undefined
    ///&#10;If set, the drag event will be tracked for the surface boundaries. By default, leaving the element boundaries will end the drag.
    ///&#10;
    /// &#10;threshold — Number (default: 0)
    ///&#10;The minimum distance the mouse/touch should move before the event is triggered.
    ///&#10;
    /// </summary>
    /// <param name="options" type="Object">
    /// The widget configuration options
    /// </param>
};







kendo.DragAxis = function() { };

kendo.DragAxis.prototype = {




    
    bind: function(event, callback) {
        /// <summary>
        /// Binds to a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be executed when the event is triggered.</param>
    },
    

    
    unbind: function(event, callback) {
        /// <summary>
        /// Unbinds a callback from a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be removed.</param>
    }
    

};

$.fn.getKendoDragAxis = function() {
    /// <summary>
    /// Returns a reference to the kendo.DragAxis widget, instantiated on the selector.
    /// </summary>
    /// <returns type="kendo.DragAxis">The kendo.DragAxis instance (if present).</returns>
};

$.fn.kendoDragAxis = function(options) {
    /// <summary>
    /// Instantiates a kendo.DragAxis widget based the DOM elements that match the selector.
    /// </summary>
    /// <param name="options" type="Object">
    /// The widget configuration options
    /// </param>
};







kendo.data.DataSource = function() { };

kendo.data.DataSource.prototype = {



    
    
    
    add: function(model) {
        /// <summary>
        /// Adds a new Model instance to the DataSource
        /// </summary>

        /// <param name="model" type="Object" >Either a Model instance or raw object from which the Model will be created</param>


        /// <returns type="Object">The Model instance which has been added</returns>


        },

    
    
    
    aggregate: function(val) {
        /// <summary>
        /// Get current aggregate descriptors or applies aggregates to the data.
        /// </summary>

        /// <param name="val" type="Object|Array" >_optional, default: _<undefined> Aggregate(s) to be applied to the data.</param>


        /// <returns type="Array">Current aggregate descriptors</returns>


        },

    
    
    
    aggregates: function() {
        /// <summary>
        /// Get result of aggregates calculation
        /// </summary>


        /// <returns type="Array">Aggregates result</returns>


        },

    
    
    
    at: function(index) {
        /// <summary>
        /// Returns the raw data record at the specified index
        /// </summary>

        /// <param name="index" type="Number" >The zero-based index of the data record</param>


        /// <returns type="Object"></returns>


        },

    
    
    
    cancelChanges: function(model) {
        /// <summary>
        /// Cancel the changes made to the DataSource after the last sync. Any changes currently existing in the model
/// will be discarded.
        /// </summary>

        /// <param name="model" type="" ></param>



        },

    
    
    
    data: function(value) {
        /// <summary>
        /// Get data returned from the transport
        /// </summary>

        /// <param name="value" type="" ></param>


        /// <returns type="Array">Array of items</returns>


        },

    
    
    
    fetch: function(callback) {
        /// <summary>
        /// Fetches data using the current filter/sort/group/paging information.
/// If data is not available or remote operations are enabled data is requested through the transport,
/// otherwise operations are executed over the available data.
        /// </summary>

        /// <param name="callback" type="" ></param>



        },

    
    
    
    filter: function(val) {
        /// <summary>
        /// Get current filters or filter the data._Supported filter operators/aliases are_:
        /// </summary>

        /// <param name="val" type="Object|Array" >_optional, default: _<undefined> Filter(s) to be applied to the data.</param>


        /// <returns type="Array">Current filter descriptors</returns>


        },

    
    
    
    get: function(id) {
        /// <summary>
        /// Retrieves a Model instance by given id.
        /// </summary>

        /// <param name="id" type="Number" >The id of the model to be retrieved</param>


        /// <returns type="Object">Model instance if found</returns>


        },

    
    
    
    getByUid: function(uid) {
        /// <summary>
        /// Retrieves a Model instance by its UID.
        /// </summary>

        /// <param name="uid" type="String" >The uid of the record to be retrieved</param>


        /// <returns type="Object">Model instance if found</returns>


        },

    
    
    
    group: function(val) {
        /// <summary>
        /// Get current group descriptors or group the data.
        /// </summary>

        /// <param name="val" type="Object|Array" >_optional, default: _<undefined> Group(s) to be applied to the data.</param>


        /// <returns type="Array">Current grouping descriptors</returns>


        },

    
    
    
    insert: function(index,model) {
        /// <summary>
        /// Inserts a new Model instance to the DataSource.
        /// </summary>

        /// <param name="index" type="Number" >Index at which the Model will be inserted</param>

        /// <param name="model" type="Object" >Either a Model instance or raw object from which the Model will be created</param>


        /// <returns type="Object">The Model instance which has been inserted</returns>


        },

    
    
    
    page: function(val) {
        /// <summary>
        /// Get current page index or request a page with specified index.
        /// </summary>

        /// <param name="val" type="Number" >_optional, default: _<undefined> The index of the page to be retrieved</param>


        /// <returns type="Number">Current page index</returns>


        },

    
    
    
    pageSize: function(val) {
        /// <summary>
        /// Get current pageSize or request a page with specified number of records.
        /// </summary>

        /// <param name="val" type="Number" >_optional, default: _<undefined> The of number of records to be retrieved.</param>


        /// <returns type="Number">Current page size</returns>


        },

    
    
    
    query: function(options) {
        /// <summary>
        /// Executes a query over the data. Available operations are paging, sorting, filtering, grouping.
/// If data is not available or remote operations are enabled, data is requested through the transport.
/// Otherwise operations are executed over the available data.
        /// </summary>

        /// <param name="options" type="Object" >_optional, default: _Contains the settings for the operations. Note: If setting for previous operation is omitted, this operation is not applied to the resulting view</param>



        },

    
    
    
    read: function(data) {
        /// <summary>
        /// Read the data into the DataSource using the transport read definition
        /// </summary>

        /// <param name="data" type="" ></param>



        },

    
    
    
    remove: function(model) {
        /// <summary>
        /// Remove given Model instance from the DataSource.
        /// </summary>

        /// <param name="model" type="Object" >Model instance to be removed</param>



        },

    
    
    
    sort: function(val) {
        /// <summary>
        /// Get current sort descriptors or sorts the data.
        /// </summary>

        /// <param name="val" type="Object | Array" >_optional, default: _<undefined> Sort options to be applied to the data</param>


        /// <returns type="Array">Current sort descriptors</returns>


        },

    
    
    
    sync: function() {
        /// <summary>
        /// Synchronizes changes through the transport. Any pending CRUD operations will be sent to the server.
/// <p>If the DataSource is in **batch** mode, only one call will be made for each type of operation.
/// Otherwise, the DataSource will send one command per pending item change per change type.
        /// </summary>



        },

    
    
    
    total: function() {
        /// <summary>
        /// Get the total number of records
        /// </summary>



        },

    
    
    
    totalPages: function() {
        /// <summary>
        /// Get the number of available pages.
        /// </summary>


        /// <returns type="Number">Number of available pages.</returns>


        },

    
    
    
    view: function() {
        /// <summary>
        /// Returns a view of the data with operation such as in-memory sorting, paring, grouping and filtering are applied.
/// To ensure that data is available this method should be use from within change event of the dataSource.
        /// </summary>


        /// <returns type="Array">Array of items</returns>


        },


    
    bind: function(event, callback) {
        /// <summary>
        /// Binds to a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be executed when the event is triggered.</param>
    },
    

    
    unbind: function(event, callback) {
        /// <summary>
        /// Unbinds a callback from a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be removed.</param>
    }
    

};

$.fn.getKendoDataDataSource = function() {
    /// <summary>
    /// Returns a reference to the kendo.data.DataSource widget, instantiated on the selector.
    /// </summary>
    /// <returns type="kendo.data.DataSource">The kendo.data.DataSource instance (if present).</returns>
};

$.fn.kendoDataDataSource = function(options) {
    /// <summary>
    /// Instantiates a kendo.data.DataSource widget based the DOM elements that match the selector.
    
    /// &#10;Accepts an object with the following configuration options:
    /// &#10;
    /// &#10;aggregate — Array | Object (default: undefined)
    ///&#10;Sets fields on which initial aggregates should be calculated
    ///&#10;
    /// &#10;data — Array undefined
    ///&#10;Specifies the local JavaScript object to use for the data source.
    ///&#10;
    /// &#10;filter — Array | Object (default: undefined)
    ///&#10;Sets initial filter
    ///&#10;
    /// &#10;group — Array | Object (default: undefined)
    ///&#10;Sets initial grouping
    ///&#10;
    /// &#10;page — Number (default: undefined)
    ///&#10;Sets the index of the displayed page of data.
    ///&#10;
    /// &#10;pageSize — Number (default: undefined)
    ///&#10;Sets the number of records which contains a given page of data.
    ///&#10;
    /// &#10;schema — Object undefined
    ///&#10;Set the object responsible for describing the raw data format
    ///&#10;
    /// &#10;serverAggregates — Boolean (default: false)
    ///&#10;Determines if aggregates should be calculated on the server.
    ///&#10;
    /// &#10;serverFiltering — Boolean (default: false)
    ///&#10;Determines if filtering of the data should be handled on the server.The **serverFiltering** must be used in conjunction with the **filter** configuration.  By default, a filter object is sent to the server with the query string in the following form:*   filter[logic]: and
/// &#10;*   filter[filters][0][field]: orderId
/// &#10;*   filter[filters][0][operator]: desc
/// &#10;*   filter[filters][0][value]: 10248Possible values for **operator** include:
    ///&#10;
    /// &#10;serverGrouping — Boolean (default: false)
    ///&#10;Determines if grouping of the data should be handled on the server.The **serverGrouping** must be used in conjunction with the **group** configuration.  By default, a group object is sent to the server with the query string in the following form:*   group[0][field]: orderId
/// &#10;*   group[0][dir]: descIt is possible to modify these parameters by using the **parameterMap** function found on the **transport** object (see **transport** in Configuration).
    ///&#10;
    /// &#10;serverPaging — Boolean (default: false)
    ///&#10;Determines if paging of the data should be handled on the server.**serverPaging** must be used in conjunction with the **pageSize** configuration setting. The following options to the server as part of the query string by default:
    ///&#10;
    /// &#10;serverSorting — Boolean (default: false)
    ///&#10;Determines if sorting of the data should be handled on the server.The **serverSorting** must be used in conjunction with the **sort** configuration.  By default, a sort object is sent to the server with the query string in the following form:*   sort[0][field]: orderId
/// &#10;*   sort[0][dir]: ascIt is possible to modify these parameters by using the **parameterMap** function found on the **transport** object (see **transport** in Configuration).
    ///&#10;
    /// &#10;sort — Array | Object (default: undefined)
    ///&#10;Sets initial sort order
    ///&#10;
    /// &#10;transport — Object undefined
    ///&#10;Sets the object responsible for loading and saving of data.
/// &#10;This can be a remote or local/in-memory data.
    ///&#10;
    /// &#10;type — String undefined
    ///&#10;Loads transport with preconfigured settings. Currently supports only "odata" (Requires kendo.data.odata.js to be included).
    ///&#10;
    /// </summary>
    /// <param name="options" type="Object">
    /// The widget configuration options
    /// </param>
};







kendo.mobile.Application = function() { };

kendo.mobile.Application.prototype = {



    
    
    
    hideLoading: function() {
        /// <summary>
        /// Hide the loading animation.
        /// </summary>



        },

    
    
    
    navigate: function(url,transition) {
        /// <summary>
        /// Navigate to local or to remote view.
        /// </summary>

        /// <param name="url" type="String" >The id or url of the view.</param>

        /// <param name="transition" type="String" >The transition to apply when navigating. See View Transitions section for more information.</param>



        },

    
    
    
    scroller: function() {
        /// <summary>
        /// Get a reference to the current view's scroller widget instance.
        /// </summary>


        /// <returns type="Scroller">the scroller widget instance.</returns>


        },

    
    
    
    showLoading: function() {
        /// <summary>
        /// Show the loading animation.
        /// </summary>



        },

    
    
    
    view: function() {
        /// <summary>
        /// Get a reference to the current view.
        /// </summary>


        /// <returns type="View">the view instance.</returns>


        },


    
    bind: function(event, callback) {
        /// <summary>
        /// Binds to a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be executed when the event is triggered.</param>
    },
    

    
    unbind: function(event, callback) {
        /// <summary>
        /// Unbinds a callback from a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be removed.</param>
    }
    

};

$.fn.getKendoMobileApplication = function() {
    /// <summary>
    /// Returns a reference to the kendo.mobile.Application widget, instantiated on the selector.
    /// </summary>
    /// <returns type="kendo.mobile.Application">The kendo.mobile.Application instance (if present).</returns>
};

$.fn.kendoMobileApplication = function(options) {
    /// <summary>
    /// Instantiates a kendo.mobile.Application widget based the DOM elements that match the selector.
    
    /// &#10;Accepts an object with the following configuration options:
    /// &#10;
    /// &#10;hideAddressBar — Boolean (default: true)
    ///&#10;Whether to hide the browser address bar.
/// &#10;
/// &#10;new kendo.mobile.Application($(document.body), { layout: "foo" });
/// &#10;
    ///&#10;
    /// &#10;initial — String undefined
    ///&#10;The id of the initial mobilie View to display.
    ///&#10;
    /// &#10;layout — String undefined
    ///&#10;The id of the default Application Layout.
    ///&#10;
    /// &#10;loading — String (default: Loading...)
    ///&#10;The text displayed in the loading popup. Setting this value to false will disable the loading popup.
    ///&#10;
    /// &#10;platform — String undefined
    ///&#10;Which platform look to force on the application. Can be one of "ios", "android", "blackberry".
    ///&#10;
    /// &#10;transition — String undefined
    ///&#10;The default View transition.
    ///&#10;
    /// </summary>
    /// <param name="options" type="Object">
    /// The widget configuration options
    /// </param>
};







kendo.mobile.ui.ActionSheet = function() { };

kendo.mobile.ui.ActionSheet.prototype = {



    
    
    
    close: function() {
        /// <summary>
        /// Close the ActionSheet.
        /// </summary>



        },

    
    
    
    open: function(target,context) {
        /// <summary>
        /// Open the ActionSheet.
        /// </summary>

        /// <param name="target" type="jQuery" >(optional) The target of the ActionSheet, available in the callback methods.</param>

        /// <param name="context" type="Object" >(optional) The context of the ActionSheet, available in the callback methods.</param>



        },


    
    bind: function(event, callback) {
        /// <summary>
        /// Binds to a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be executed when the event is triggered.</param>
    },
    

    
    unbind: function(event, callback) {
        /// <summary>
        /// Unbinds a callback from a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be removed.</param>
    }
    

};

$.fn.getKendoMobileActionSheet = function() {
    /// <summary>
    /// Returns a reference to the kendo.mobile.ui.ActionSheet widget, instantiated on the selector.
    /// </summary>
    /// <returns type="kendo.mobile.ui.ActionSheet">The kendo.mobile.ui.ActionSheet instance (if present).</returns>
};

$.fn.kendoMobileActionSheet = function(options) {
    /// <summary>
    /// Instantiates a kendo.mobile.ui.ActionSheet widget based the DOM elements that match the selector.
    
    /// &#10;Accepts an object with the following configuration options:
    /// &#10;
    /// &#10;cancel — String (default: Cancel)
    ///&#10;The text of the cancel button.
    ///&#10;
    /// &#10;popup — Object undefined
    ///&#10;The popup configuration options (tablet only).
    ///&#10;
    /// </summary>
    /// <param name="options" type="Object">
    /// The widget configuration options
    /// </param>
};







kendo.mobile.ui.BackButton = function() { };

kendo.mobile.ui.BackButton.prototype = {




    
    bind: function(event, callback) {
        /// <summary>
        /// Binds to a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be executed when the event is triggered.</param>
    },
    

    
    unbind: function(event, callback) {
        /// <summary>
        /// Unbinds a callback from a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be removed.</param>
    }
    

};

$.fn.getKendoMobileBackButton = function() {
    /// <summary>
    /// Returns a reference to the kendo.mobile.ui.BackButton widget, instantiated on the selector.
    /// </summary>
    /// <returns type="kendo.mobile.ui.BackButton">The kendo.mobile.ui.BackButton instance (if present).</returns>
};

$.fn.kendoMobileBackButton = function(options) {
    /// <summary>
    /// Instantiates a kendo.mobile.ui.BackButton widget based the DOM elements that match the selector.
    /// </summary>
    /// <param name="options" type="Object">
    /// The widget configuration options
    /// </param>
};







kendo.mobile.ui.Button = function() { };

kendo.mobile.ui.Button.prototype = {




    
    bind: function(event, callback) {
        /// <summary>
        /// Binds to a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be executed when the event is triggered.</param>
    },
    

    
    unbind: function(event, callback) {
        /// <summary>
        /// Unbinds a callback from a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be removed.</param>
    }
    

};

$.fn.getKendoMobileButton = function() {
    /// <summary>
    /// Returns a reference to the kendo.mobile.ui.Button widget, instantiated on the selector.
    /// </summary>
    /// <returns type="kendo.mobile.ui.Button">The kendo.mobile.ui.Button instance (if present).</returns>
};

$.fn.kendoMobileButton = function(options) {
    /// <summary>
    /// Instantiates a kendo.mobile.ui.Button widget based the DOM elements that match the selector.
    
    /// &#10;Accepts an object with the following configuration options:
    /// &#10;
    /// &#10;icon — String undefined
    ///&#10;The icon of the button. It can be either one of the built-in icons, or a custom one.
    ///&#10;
    /// </summary>
    /// <param name="options" type="Object">
    /// The widget configuration options
    /// </param>
};







kendo.mobile.ui.ButtonGroup = function() { };

kendo.mobile.ui.ButtonGroup.prototype = {



    
    
    
    current: function() {
        /// <summary>
        /// Get the currently selected Button.
        /// </summary>


        /// <returns type="jQuery">the currently selected Button.</returns>


        },

    
    
    
    select: function(li) {
        /// <summary>
        /// Select a Button.
        /// </summary>

        /// <param name="li" type="jQuery | Number" >LI element or index of the Button.</param>



        },


    
    bind: function(event, callback) {
        /// <summary>
        /// Binds to a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be executed when the event is triggered.</param>
    },
    

    
    unbind: function(event, callback) {
        /// <summary>
        /// Unbinds a callback from a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be removed.</param>
    }
    

};

$.fn.getKendoMobileButtonGroup = function() {
    /// <summary>
    /// Returns a reference to the kendo.mobile.ui.ButtonGroup widget, instantiated on the selector.
    /// </summary>
    /// <returns type="kendo.mobile.ui.ButtonGroup">The kendo.mobile.ui.ButtonGroup instance (if present).</returns>
};

$.fn.kendoMobileButtonGroup = function(options) {
    /// <summary>
    /// Instantiates a kendo.mobile.ui.ButtonGroup widget based the DOM elements that match the selector.
    
    /// &#10;Accepts an object with the following configuration options:
    /// &#10;
    /// &#10;index — Number undefined
    ///&#10;Defines the initially selected Button.
    ///&#10;
    /// </summary>
    /// <param name="options" type="Object">
    /// The widget configuration options
    /// </param>
};







kendo.mobile.ui.DetailButton = function() { };

kendo.mobile.ui.DetailButton.prototype = {




    
    bind: function(event, callback) {
        /// <summary>
        /// Binds to a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be executed when the event is triggered.</param>
    },
    

    
    unbind: function(event, callback) {
        /// <summary>
        /// Unbinds a callback from a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be removed.</param>
    }
    

};

$.fn.getKendoMobileDetailButton = function() {
    /// <summary>
    /// Returns a reference to the kendo.mobile.ui.DetailButton widget, instantiated on the selector.
    /// </summary>
    /// <returns type="kendo.mobile.ui.DetailButton">The kendo.mobile.ui.DetailButton instance (if present).</returns>
};

$.fn.kendoMobileDetailButton = function(options) {
    /// <summary>
    /// Instantiates a kendo.mobile.ui.DetailButton widget based the DOM elements that match the selector.
    /// </summary>
    /// <param name="options" type="Object">
    /// The widget configuration options
    /// </param>
};







kendo.mobile.ui.Layout = function() { };

kendo.mobile.ui.Layout.prototype = {




    
    bind: function(event, callback) {
        /// <summary>
        /// Binds to a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be executed when the event is triggered.</param>
    },
    

    
    unbind: function(event, callback) {
        /// <summary>
        /// Unbinds a callback from a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be removed.</param>
    }
    

};

$.fn.getKendoMobileLayout = function() {
    /// <summary>
    /// Returns a reference to the kendo.mobile.ui.Layout widget, instantiated on the selector.
    /// </summary>
    /// <returns type="kendo.mobile.ui.Layout">The kendo.mobile.ui.Layout instance (if present).</returns>
};

$.fn.kendoMobileLayout = function(options) {
    /// <summary>
    /// Instantiates a kendo.mobile.ui.Layout widget based the DOM elements that match the selector.
    
    /// &#10;Accepts an object with the following configuration options:
    /// &#10;
    /// &#10;id — String (default: null)
    ///&#10;The id of the layout. Required.
    ///&#10;
    /// &#10;platform — String undefined
    ///&#10;The specific platform this layout targets. By default, layouts are displayed
/// &#10;on all platforms.
    ///&#10;
    /// </summary>
    /// <param name="options" type="Object">
    /// The widget configuration options
    /// </param>
};







kendo.mobile.ui.ListView = function() { };

kendo.mobile.ui.ListView.prototype = {



    
    
    
    items: function() {
        /// <summary>
        /// Get the listview DOM element items
        /// </summary>


        /// <returns type="jQuery">The listview DOM element items</returns>


        },

    
    
    
    refresh: function(e) {
        /// <summary>
        /// Repaints the listview (works only in databound mode).
        /// </summary>

        /// <param name="e" type="" ></param>



        },


    
    bind: function(event, callback) {
        /// <summary>
        /// Binds to a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be executed when the event is triggered.</param>
    },
    

    
    unbind: function(event, callback) {
        /// <summary>
        /// Unbinds a callback from a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be removed.</param>
    }
    

};

$.fn.getKendoMobileListView = function() {
    /// <summary>
    /// Returns a reference to the kendo.mobile.ui.ListView widget, instantiated on the selector.
    /// </summary>
    /// <returns type="kendo.mobile.ui.ListView">The kendo.mobile.ui.ListView instance (if present).</returns>
};

$.fn.kendoMobileListView = function(options) {
    /// <summary>
    /// Instantiates a kendo.mobile.ui.ListView widget based the DOM elements that match the selector.
    
    /// &#10;Accepts an object with the following configuration options:
    /// &#10;
    /// &#10;appendOnRefresh — Boolean (default: false)
    ///&#10;Used in combination with pullToRefresh. If set to true, newly loaded data will be appended on top when refershing.
    ///&#10;
    /// &#10;autoBind — Boolean (default: true)
    ///&#10;Indicates whether the listview will call read on the DataSource initially.
    ///&#10;
    /// &#10;dataSource — kendo.data.DataSource | Object undefined
    ///&#10;Instance of DataSource or the data that the mobile ListView will be bound to.
    ///&#10;
    /// &#10;endlessScroll — Boolean (default: false)
    ///&#10;If set to true, the listview gets the next page of data when the user scrolls near the bottom of the view.
    ///&#10;
    /// &#10;fixedHeaders — Boolean (default: false)
    ///&#10;If set to true, the group headers will persist their position when the user scrolls through the listview. Applicable only when the type is set to group, or when binding to grouped datasource.
    ///&#10;
    /// &#10;headerTemplate — String (default: #:value#)
    ///&#10;The header item template (applicable when the type is set to group).
    ///&#10;
    /// &#10;loadMore — Boolean (default: false)
    ///&#10;If set to true, a button is rendered at the bottom of the listview, which fetch the next page of data when tapped.
    ///&#10;
    /// &#10;loadMoreText — String (default: "Press to load more")
    ///&#10;The text of the rendered load-more button (applies only if loadMore is set to true).
    ///&#10;
    /// &#10;pullTemplate — String (default: "Pull to refresh")
    ///&#10;The message template displayed when the user pulls the listView. Applicable only when pullToRefresh is set to true.
    ///&#10;
    /// &#10;pullToRefresh — Boolean (default: false)
    ///&#10;If set to true, the listview will reload its data when the user pulls the view over the top limit.
    ///&#10;
    /// &#10;refreshTemplate — String (default: "Refreshing")
    ///&#10;The message template displayed during the refresh. Applicable only when pullToRefresh is set to true.
    ///&#10;
    /// &#10;releaseTemplate — String (default: "Release to refresh")
    ///&#10;The message template indicating that pullToRefresh will occur. Applicable only when pullToRefresh is set to true.
    ///&#10;
    /// &#10;scrollTreshold — String (default: 30)
    ///&#10;The distance to the bottom in pixels, after which the listview will start fetching the next page. Applicable only when endlessScroll is set to true.
    ///&#10;
    /// &#10;style — String undefined
    ///&#10;The style of the control. Can be either empty string(""), or inset.
    ///&#10;
    /// &#10;template — String (default: #:data#)
    ///&#10;The item template.
    ///&#10;
    /// &#10;type — String undefined
    ///&#10;The type of the control. Can be either `flat` (default) or group. Determined automatically in databound mode.
    ///&#10;
    /// </summary>
    /// <param name="options" type="Object">
    /// The widget configuration options
    /// </param>
};







kendo.mobile.ui.Loader = function() { };

kendo.mobile.ui.Loader.prototype = {



    
    
    
    hide: function() {
        /// <summary>
        /// Hide the loading animation.
        /// </summary>



        },

    
    
    
    show: function() {
        /// <summary>
        /// Show the loading animation.
        /// </summary>



        },


    
    bind: function(event, callback) {
        /// <summary>
        /// Binds to a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be executed when the event is triggered.</param>
    },
    

    
    unbind: function(event, callback) {
        /// <summary>
        /// Unbinds a callback from a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be removed.</param>
    }
    

};

$.fn.getKendoMobileLoader = function() {
    /// <summary>
    /// Returns a reference to the kendo.mobile.ui.Loader widget, instantiated on the selector.
    /// </summary>
    /// <returns type="kendo.mobile.ui.Loader">The kendo.mobile.ui.Loader instance (if present).</returns>
};

$.fn.kendoMobileLoader = function(options) {
    /// <summary>
    /// Instantiates a kendo.mobile.ui.Loader widget based the DOM elements that match the selector.
    /// </summary>
    /// <param name="options" type="Object">
    /// The widget configuration options
    /// </param>
};







kendo.mobile.ui.ModalView = function() { };

kendo.mobile.ui.ModalView.prototype = {



    
    
    
    close: function() {
        /// <summary>
        /// Close the ModalView
        /// </summary>



        },

    
    
    
    open: function(target) {
        /// <summary>
        /// Open the ModalView
        /// </summary>

        /// <param name="target" type="jQuery" >(optional) The target of the ModalView</param>



        },


    
    bind: function(event, callback) {
        /// <summary>
        /// Binds to a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be executed when the event is triggered.</param>
    },
    

    
    unbind: function(event, callback) {
        /// <summary>
        /// Unbinds a callback from a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be removed.</param>
    }
    

};

$.fn.getKendoMobileModalView = function() {
    /// <summary>
    /// Returns a reference to the kendo.mobile.ui.ModalView widget, instantiated on the selector.
    /// </summary>
    /// <returns type="kendo.mobile.ui.ModalView">The kendo.mobile.ui.ModalView instance (if present).</returns>
};

$.fn.kendoMobileModalView = function(options) {
    /// <summary>
    /// Instantiates a kendo.mobile.ui.ModalView widget based the DOM elements that match the selector.
    
    /// &#10;Accepts an object with the following configuration options:
    /// &#10;
    /// &#10;height — Number undefined
    ///&#10;The height of the ModalView container in pixels. If not set, the element style is used.
    ///&#10;
    /// &#10;modal — Boolean (default: true)
    ///&#10;When set to false, the ModalView will close when the user taps outside of its element.
    ///&#10;
    /// &#10;width — Number undefined
    ///&#10;The width of the ModalView container in pixels. If not set, the element style is used.
    ///&#10;
    /// </summary>
    /// <param name="options" type="Object">
    /// The widget configuration options
    /// </param>
};







kendo.mobile.ui.NavBar = function() { };

kendo.mobile.ui.NavBar.prototype = {



    
    
    
    title: function(value) {
        /// <summary>
        /// Update the title element text. The title element is specified by setting the `role` data attribute to `view-title`.
        /// </summary>

        /// <param name="value" type="String" >The text of title</param>



        },


    
    bind: function(event, callback) {
        /// <summary>
        /// Binds to a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be executed when the event is triggered.</param>
    },
    

    
    unbind: function(event, callback) {
        /// <summary>
        /// Unbinds a callback from a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be removed.</param>
    }
    

};

$.fn.getKendoMobileNavBar = function() {
    /// <summary>
    /// Returns a reference to the kendo.mobile.ui.NavBar widget, instantiated on the selector.
    /// </summary>
    /// <returns type="kendo.mobile.ui.NavBar">The kendo.mobile.ui.NavBar instance (if present).</returns>
};

$.fn.kendoMobileNavBar = function(options) {
    /// <summary>
    /// Instantiates a kendo.mobile.ui.NavBar widget based the DOM elements that match the selector.
    /// </summary>
    /// <param name="options" type="Object">
    /// The widget configuration options
    /// </param>
};







kendo.mobile.ui.Pane = function() { };

kendo.mobile.ui.Pane.prototype = {



    
    
    
    hideLoading: function() {
        /// <summary>
        /// Hide the loading animation.
        /// </summary>



        },

    
    
    
    navigate: function(url,transition) {
        /// <summary>
        /// Navigate the local or remote view.
        /// </summary>

        /// <param name="url" type="String" >The id or url of the view.</param>

        /// <param name="transition" type="String" >The transition to apply when navigating. See View Transitions section for more information.</param>



        },

    
    
    
    showLoading: function() {
        /// <summary>
        /// Show the loading animation.
        /// </summary>



        },

    
    
    
    view: function() {
        /// <summary>
        /// Get a reference to the current view.
        /// </summary>


        /// <returns type="View">the view instance.</returns>


        },


    
    bind: function(event, callback) {
        /// <summary>
        /// Binds to a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be executed when the event is triggered.</param>
    },
    

    
    unbind: function(event, callback) {
        /// <summary>
        /// Unbinds a callback from a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be removed.</param>
    }
    

};

$.fn.getKendoMobilePane = function() {
    /// <summary>
    /// Returns a reference to the kendo.mobile.ui.Pane widget, instantiated on the selector.
    /// </summary>
    /// <returns type="kendo.mobile.ui.Pane">The kendo.mobile.ui.Pane instance (if present).</returns>
};

$.fn.kendoMobilePane = function(options) {
    /// <summary>
    /// Instantiates a kendo.mobile.ui.Pane widget based the DOM elements that match the selector.
    
    /// &#10;Accepts an object with the following configuration options:
    /// &#10;
    /// &#10;initial — String undefined
    ///&#10;The id of the initial mobilie View to display.
    ///&#10;
    /// &#10;layout — String undefined
    ///&#10;The id of the default Pane Layout.
    ///&#10;
    /// &#10;loading — String (default: Loading...)
    ///&#10;The text displayed in the loading popup. Setting this value to false will disable the loading popup.
    ///&#10;
    /// &#10;transition — String undefined
    ///&#10;The default View transition.
    ///&#10;
    /// </summary>
    /// <param name="options" type="Object">
    /// The widget configuration options
    /// </param>
};







kendo.mobile.ui.PopOver = function() { };

kendo.mobile.ui.PopOver.prototype = {



    
    
    
    close: function() {
        /// <summary>
        /// Close the popover.
        /// </summary>



        },

    
    
    
    openFor: function(target) {
        /// <summary>
        /// Open the ActionSheet.
        /// </summary>

        /// <param name="target" type="jQuery" >The target of the Popover, to which the visual arrow will point to.</param>



        },


    
    bind: function(event, callback) {
        /// <summary>
        /// Binds to a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be executed when the event is triggered.</param>
    },
    

    
    unbind: function(event, callback) {
        /// <summary>
        /// Unbinds a callback from a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be removed.</param>
    }
    

};

$.fn.getKendoMobilePopOver = function() {
    /// <summary>
    /// Returns a reference to the kendo.mobile.ui.PopOver widget, instantiated on the selector.
    /// </summary>
    /// <returns type="kendo.mobile.ui.PopOver">The kendo.mobile.ui.PopOver instance (if present).</returns>
};

$.fn.kendoMobilePopOver = function(options) {
    /// <summary>
    /// Instantiates a kendo.mobile.ui.PopOver widget based the DOM elements that match the selector.
    
    /// &#10;Accepts an object with the following configuration options:
    /// &#10;
    /// &#10;pane — Object undefined
    ///&#10;The pane configuration options.
    ///&#10;
    /// &#10;popup — Object undefined
    ///&#10;The popup configuration options.
    ///&#10;
    /// </summary>
    /// <param name="options" type="Object">
    /// The widget configuration options
    /// </param>
};







kendo.mobile.ui.ScrollView = function() { };

kendo.mobile.ui.ScrollView.prototype = {



    
    
    
    content: function(content) {
        /// <summary>
        /// Update the scrollview HTML content
        /// </summary>

        /// <param name="content" type="String | jQuery" >the new scrollView content.</param>



        },

    
    
    
    refresh: function() {
        /// <summary>
        /// Redraw the mobile ScrollView pager. Called automatically on device orientation change event.
        /// </summary>



        },

    
    
    
    scrollTo: function(page) {
        /// <summary>
        /// Scroll to the given page. Pages are zero-based indexed.
        /// </summary>

        /// <param name="page" type="Number" >The page to scroll to.</param>



        },


    
    bind: function(event, callback) {
        /// <summary>
        /// Binds to a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be executed when the event is triggered.</param>
    },
    

    
    unbind: function(event, callback) {
        /// <summary>
        /// Unbinds a callback from a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be removed.</param>
    }
    

};

$.fn.getKendoMobileScrollView = function() {
    /// <summary>
    /// Returns a reference to the kendo.mobile.ui.ScrollView widget, instantiated on the selector.
    /// </summary>
    /// <returns type="kendo.mobile.ui.ScrollView">The kendo.mobile.ui.ScrollView instance (if present).</returns>
};

$.fn.kendoMobileScrollView = function(options) {
    /// <summary>
    /// Instantiates a kendo.mobile.ui.ScrollView widget based the DOM elements that match the selector.
    
    /// &#10;Accepts an object with the following configuration options:
    /// &#10;
    /// &#10;bounceVelocityThreshold — Number (default: 1.6)
    ///&#10;The velocity threshold after which a swipe will result in a bounce effect.
    ///&#10;
    /// &#10;duration — Number (default: 300)
    ///&#10;The milliseconds that take the ScrollView to snap to the current page after released.
    ///&#10;
    /// &#10;page — Number (default: 0)
    ///&#10;The initial page to display.
    ///&#10;
    /// &#10;velocityThreshold — Number (default: 0.8)
    ///&#10;The velocity threshold after which a swipe will navigate to the next page (as opposed to snapping back to the current page).
    ///&#10;
    /// </summary>
    /// <param name="options" type="Object">
    /// The widget configuration options
    /// </param>
};







kendo.mobile.ui.Scroller = function() { };

kendo.mobile.ui.Scroller.prototype = {



    
    
    
    pullHandled: function() {
        /// <summary>
        /// Indicate that the pull event is handled (i.e. data from the server has been retrieved).
        /// </summary>



        },

    
    
    
    reset: function() {
        /// <summary>
        /// Scrolls the container to the top.
        /// </summary>



        },

    
    
    
    scrollHeight: function() {
        /// <summary>
        /// Returns the height in pixels of the scroller content.
        /// </summary>



        },

    
    
    
    scrollTo: function(x,y) {
        /// <summary>
        /// Scrolls the container to the specified location
        /// </summary>

        /// <param name="x" type="Number" >The horizontal offset in pixels to scroll to.</param>

        /// <param name="y" type="Number" >The vertical offset in pixels to scroll to.</param>



        },

    
    
    
    scrollWidth: function() {
        /// <summary>
        /// Returns the width in pixels of the scroller content.
        /// </summary>



        },


    
    bind: function(event, callback) {
        /// <summary>
        /// Binds to a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be executed when the event is triggered.</param>
    },
    

    
    unbind: function(event, callback) {
        /// <summary>
        /// Unbinds a callback from a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be removed.</param>
    }
    

};

$.fn.getKendoMobileScroller = function() {
    /// <summary>
    /// Returns a reference to the kendo.mobile.ui.Scroller widget, instantiated on the selector.
    /// </summary>
    /// <returns type="kendo.mobile.ui.Scroller">The kendo.mobile.ui.Scroller instance (if present).</returns>
};

$.fn.kendoMobileScroller = function(options) {
    /// <summary>
    /// Instantiates a kendo.mobile.ui.Scroller widget based the DOM elements that match the selector.
    
    /// &#10;Accepts an object with the following configuration options:
    /// &#10;
    /// &#10;elastic — Boolean (default: true)
    ///&#10;Weather or not to allow out of bounds dragging and easing.
    ///&#10;
    /// &#10;pullOffset — Number (default: 140)
    ///&#10;The threshold below which a releasing the scroller will trigger the pull event.
/// &#10;Has effect only when the pullToRefresh option is set to true.
    ///&#10;
    /// &#10;pullTemplate — String (default: Pull to refresh)
    ///&#10;The message template displayed when the user pulls the scroller.
/// &#10;Has effect only when the pullToRefresh option is set to true.
    ///&#10;
    /// &#10;pullToRefresh — Boolean (default: false)
    ///&#10;If set to true, the scroller will display a hint when the user pulls the container beyond its top limit.
/// &#10;If a pull beyond the specified pullOffset occurs, a pull event will be triggered.
    ///&#10;
    /// &#10;refreshTemplate — String (default: Refreshing)
    ///&#10;The message template displayed during the refresh.
/// &#10;Has effect only when the pullToRefresh option is set to true.
    ///&#10;
    /// &#10;releaseTemplate — String (default: Release to refresh)
    ///&#10;The message template displayed when the user pulls the scroller below the
/// &#10;pullOffset, indicating that pullToRefresh will occur.
/// &#10;Has effect only when the pullToRefresh option is set to true.
    ///&#10;
    /// </summary>
    /// <param name="options" type="Object">
    /// The widget configuration options
    /// </param>
};







kendo.mobile.ui.SplitView = function() { };

kendo.mobile.ui.SplitView.prototype = {




    
    bind: function(event, callback) {
        /// <summary>
        /// Binds to a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be executed when the event is triggered.</param>
    },
    

    
    unbind: function(event, callback) {
        /// <summary>
        /// Unbinds a callback from a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be removed.</param>
    }
    

};

$.fn.getKendoMobileSplitView = function() {
    /// <summary>
    /// Returns a reference to the kendo.mobile.ui.SplitView widget, instantiated on the selector.
    /// </summary>
    /// <returns type="kendo.mobile.ui.SplitView">The kendo.mobile.ui.SplitView instance (if present).</returns>
};

$.fn.kendoMobileSplitView = function(options) {
    /// <summary>
    /// Instantiates a kendo.mobile.ui.SplitView widget based the DOM elements that match the selector.
    /// </summary>
    /// <param name="options" type="Object">
    /// The widget configuration options
    /// </param>
};







kendo.mobile.ui.Swipe = function() { };

kendo.mobile.ui.Swipe.prototype = {




    
    bind: function(event, callback) {
        /// <summary>
        /// Binds to a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be executed when the event is triggered.</param>
    },
    

    
    unbind: function(event, callback) {
        /// <summary>
        /// Unbinds a callback from a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be removed.</param>
    }
    

};

$.fn.getKendoMobileSwipe = function() {
    /// <summary>
    /// Returns a reference to the kendo.mobile.ui.Swipe widget, instantiated on the selector.
    /// </summary>
    /// <returns type="kendo.mobile.ui.Swipe">The kendo.mobile.ui.Swipe instance (if present).</returns>
};

$.fn.kendoMobileSwipe = function(options) {
    /// <summary>
    /// Instantiates a kendo.mobile.ui.Swipe widget based the DOM elements that match the selector.
    
    /// &#10;Accepts an object with the following configuration options:
    /// &#10;
    /// &#10;maxDuration — Number (default: 1000)
    ///&#10;The maximum amount of time in milliseconds the swipe event can last. Slower swipes are discarded.
    ///&#10;
    /// &#10;maxYDelta — Number (default: 10)
    ///&#10;The maximum vertical deviation in pixels of the swipe event. Swipe with higher deviation are discarded.
    ///&#10;
    /// &#10;minXDelta — Number (default: 30)
    ///&#10;The minimum horizontal distance in pixels the user should swipe before the event is triggered.
    ///&#10;
    /// &#10;surface — jQuery undefined
    ///&#10;By default, swipe events are tracked only within the element boundries. If a surface is specified, the swipe events are extended to the provided surface. This is useful if  the swipe targets are small (or narrow).
    ///&#10;
    /// </summary>
    /// <param name="options" type="Object">
    /// The widget configuration options
    /// </param>
};







kendo.mobile.ui.Switch = function() { };

kendo.mobile.ui.Switch.prototype = {



    
    
    
    check: function(check) {
        /// <summary>
        /// Get/Set the checked state of the widget.
        /// </summary>

        /// <param name="check" type="Boolean" >Whether to turn the widget on or off.</param>


        /// <returns type="Boolean">The checked state of the widget.</returns>


        },

    
    
    
    toggle: function() {
        /// <summary>
        /// Toggle the checked state of the widget.
        /// </summary>



        },


    
    bind: function(event, callback) {
        /// <summary>
        /// Binds to a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be executed when the event is triggered.</param>
    },
    

    
    unbind: function(event, callback) {
        /// <summary>
        /// Unbinds a callback from a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be removed.</param>
    }
    

};

$.fn.getKendoMobileSwitch = function() {
    /// <summary>
    /// Returns a reference to the kendo.mobile.ui.Switch widget, instantiated on the selector.
    /// </summary>
    /// <returns type="kendo.mobile.ui.Switch">The kendo.mobile.ui.Switch instance (if present).</returns>
};

$.fn.kendoMobileSwitch = function(options) {
    /// <summary>
    /// Instantiates a kendo.mobile.ui.Switch widget based the DOM elements that match the selector.
    
    /// &#10;Accepts an object with the following configuration options:
    /// &#10;
    /// &#10;checked — Boolean (default: false)
    ///&#10;The checked state of the widget.
    ///&#10;
    /// &#10;offLabel — String (default: OFF)
    ///&#10;The OFF label.
    ///&#10;
    /// &#10;onLabel — String (default: ON)
    ///&#10;The ON label.
    ///&#10;
    /// </summary>
    /// <param name="options" type="Object">
    /// The widget configuration options
    /// </param>
};







kendo.mobile.ui.TabStrip = function() { };

kendo.mobile.ui.TabStrip.prototype = {



    
    
    
    currentItem: function() {
        /// <summary>
        /// Get the currently selected tab DOM element.
        /// </summary>


        /// <returns type="jQuery">the currently selected tab DOM element.</returns>


        },

    
    
    
    switchTo: function(url) {
        /// <summary>
        /// Set the mobile TabStrip active tab to the tab with the specified url.
        /// </summary>

        /// <param name="url" type="String" >The url of the tab.</param>



        },


    
    bind: function(event, callback) {
        /// <summary>
        /// Binds to a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be executed when the event is triggered.</param>
    },
    

    
    unbind: function(event, callback) {
        /// <summary>
        /// Unbinds a callback from a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be removed.</param>
    }
    

};

$.fn.getKendoMobileTabStrip = function() {
    /// <summary>
    /// Returns a reference to the kendo.mobile.ui.TabStrip widget, instantiated on the selector.
    /// </summary>
    /// <returns type="kendo.mobile.ui.TabStrip">The kendo.mobile.ui.TabStrip instance (if present).</returns>
};

$.fn.kendoMobileTabStrip = function(options) {
    /// <summary>
    /// Instantiates a kendo.mobile.ui.TabStrip widget based the DOM elements that match the selector.
    
    /// &#10;Accepts an object with the following configuration options:
    /// &#10;
    /// &#10;selectedIndex — Number (default: 0)
    ///&#10;The index of the initially selected tab.
    ///&#10;
    /// </summary>
    /// <param name="options" type="Object">
    /// The widget configuration options
    /// </param>
};







kendo.mobile.ui.View = function() { };

kendo.mobile.ui.View.prototype = {




    
    bind: function(event, callback) {
        /// <summary>
        /// Binds to a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be executed when the event is triggered.</param>
    },
    

    
    unbind: function(event, callback) {
        /// <summary>
        /// Unbinds a callback from a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be removed.</param>
    }
    

};

$.fn.getKendoMobileView = function() {
    /// <summary>
    /// Returns a reference to the kendo.mobile.ui.View widget, instantiated on the selector.
    /// </summary>
    /// <returns type="kendo.mobile.ui.View">The kendo.mobile.ui.View instance (if present).</returns>
};

$.fn.kendoMobileView = function(options) {
    /// <summary>
    /// Instantiates a kendo.mobile.ui.View widget based the DOM elements that match the selector.
    
    /// &#10;Accepts an object with the following configuration options:
    /// &#10;
    /// &#10;model — String | ObservableObject (default: null)
    ///&#10;The MVVM model to bind to. If a string is passed, The view
/// &#10;will try to resolve a reference to the view model variable in the global scope.
    ///&#10;
    /// &#10;stretch — Boolean (default: false)
    ///&#10;If set to true, the view will stretch its child contents to occupy the entire view, while disabling kinetic scrolling.
/// &#10;Useful if the view contains an image or a map.
    ///&#10;
    /// &#10;title — String undefined
    ///&#10;The text to display in the navbar title (if present) and the browser title.
    ///&#10;
    /// </summary>
    /// <param name="options" type="Object">
    /// The widget configuration options
    /// </param>
};







kendo.ui.Validator = function() { };

kendo.ui.Validator.prototype = {



    
    
    
    errors: function() {
        /// <summary>
        /// Get the error messages if any.
        /// </summary>


        /// <returns type="Array">Messages for the failed validation rules.</returns>


        },

    
    
    
    validate: function() {
        /// <summary>
        /// Validates the input element(s) against the declared validation rules.
        /// </summary>


        /// <returns type="Boolean">If all rules are passed successfully.</returns>


        },

    
    
    
    validateInput: function(input) {
        /// <summary>
        /// Validates the input element against the declared validation rules.
        /// </summary>

        /// <param name="input" type="Element" domElement="true">Input element to be validated.</param>


        /// <returns type="Boolean">If all rules are passed successfully.</returns>


        },


    
    bind: function(event, callback) {
        /// <summary>
        /// Binds to a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be executed when the event is triggered.</param>
    },
    

    
    unbind: function(event, callback) {
        /// <summary>
        /// Unbinds a callback from a widget event.
        /// </summary>
        /// <param name="event" type="String">The event name</param>
        /// <param name="callback" type="Function">The callback to be removed.</param>
    }
    

};

$.fn.getKendoValidator = function() {
    /// <summary>
    /// Returns a reference to the kendo.ui.Validator widget, instantiated on the selector.
    /// </summary>
    /// <returns type="kendo.ui.Validator">The kendo.ui.Validator instance (if present).</returns>
};

$.fn.kendoValidator = function(options) {
    /// <summary>
    /// Instantiates a kendo.ui.Validator widget based the DOM elements that match the selector.
    
    /// &#10;Accepts an object with the following configuration options:
    /// &#10;
    /// &#10;messages — Object undefined
    ///&#10;Set of messages (either strings or functions) which will be shown when given validation rule fails.
/// &#10;By setting already existing key the appropriate built-in message will be overridden.
    ///&#10;
    /// &#10;rules — Object undefined
    ///&#10;Set of validation rules. Those rules will extend the built-in ones.
    ///&#10;
    /// &#10;validateOnBlur — Boolean undefined
    ///&#10;Determines if validation will be triggered when element loses focus. Default value is true.
    ///&#10;
    /// </summary>
    /// <param name="options" type="Object">
    /// The widget configuration options
    /// </param>
};





// vim:ft=javascript
