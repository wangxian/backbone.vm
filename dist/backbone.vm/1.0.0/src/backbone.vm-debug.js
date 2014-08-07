define("backbone.vm/1.0.0/src/backbone.vm-debug", ["jquery/1.10.2/jquery-debug", "underscore/1.6.0/underscore-debug", "backbone/1.1.2/backbone-debug"], function(require, exports, module) {
  // Backbone plugin
  var $ = require("jquery/1.10.2/jquery-debug");
  var _ = require("underscore/1.6.0/underscore-debug");
  var Backbone = require("backbone/1.1.2/backbone-debug");
  // Create a plugin from backbone.js, Similar usage and backbone.view
  var VM = Backbone.VM = function(options) {
    // console.info(options);
    this.scanAttrs();
  };
  _.extend(VM.prototype, {
    // The default `tagName` of a View's element is `"div"`.
    tagName: 'div',
    scanAttrs: function() {
      console.info("scan all attributes");
    },
    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function() {}
  });
  // Set up inheritance for the VM
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  VM.extend = Backbone.View.extend;
  // Return a CMD module from seajs,
  // It must be loaded after backbone.js
  module.exports = Backbone;
});