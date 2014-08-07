//  Backbone.vm.js 1.0.0

//  (c) 2013-2014 wangxian, DocumentCloud and Investigative Reporters & Editors
//  Backbone may be freely distributed under the MIT license.
//  For all details and documentation:
//  http://github.com/wangxian/backbone.vm


var $ = require("jquery");
var _ = require("underscore");
var Backbone = require("backbone");

// Create a plugin from backbone.js, Similar usage and backbone.view
var VM = Backbone.VM = function(options) {
  // console.info(options);
  this.scanAttrs();
};

_.extend(VM.prototype, {

  // Store the relationship between Dom and model
  attrs: null,

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

