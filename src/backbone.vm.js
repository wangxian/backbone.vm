//  Backbone.vm.js 1.0.0

//  (c) 2013-2014 wangxian, DocumentCloud and Investigative Reporters & Editors
//  Backbone may be freely distributed under the MIT license.
//  For all details and documentation:
//  http://github.com/wangxian/backbone.vm

var $ = require("jquery");
var _ = require("underscore");
var Backbone = require("backbone");

// List of view options to be merged as properties.
var vmOptions = ['el', 'defaults'];

// Cached regex for stripping vm node attributes. space, \r \n
var vmAttrStripper = /\s+/g;

// Create a plugin from backbone.js, Similar usage and backbone.view
var VM = Backbone.VM = function(options) {
  this.cid = _.uniqueId('vm');
  if(!options) { options = {}; }
  _.extend(this, _.pick(options, vmOptions));

  this.$el = $(this.el);
  this.scanAttrs();

  this.vm.on("change", this.updateVM, this);
  this.vm.set(this.defaults);

  this.initialize.apply(this, arguments);
};

_.extend(VM.prototype, {

  // Set default vm scope,
  // When user's app not defined, set the defulat el 'body'
  el: "body",

  // Wrapper el using jQuery
  $el: null,

  // Store the relationship between Dom and model
  // eg, { "name":[{"$el": xx, ...}], ... }
  attrs: {},

  // Default VM value
  defaults: {},

  // Update VM bind node when vm model is updated
  updateVM: function(model) {
    // console.info("model updated:", model.changed, model.toJSON());
    var it = this;
    var attrs = _.pick(this.attrs, _.keys(model.changed));
    _.each(attrs, function(v, k){
      _.each(v, function(func){
        func(it.vm.get(k));
      });
    });
  },

  // VM's model, Your app can use it to set VM value
  // eg, this.vm.set("name", "tom")
  vm: new Backbone.Model(),

  // Scan html dom attribute contains vm="*"
  scanAttrs: function() {
    var it = this;

    var $vmAttrs = this.$el.find("[vm]");
    $vmAttrs.each(function(k, node){
      // VM HTML node
      var vmNode = node.getAttribute("vm").replace(vmAttrStripper, "").split(",");
      _.each(vmNode, function(v){
        var arr = v.split(":");
        if(arr[0] === "on") {

        } else if(arr[0] === "show") {

        } else if(arr[0] === "for") {

        } else {
          // html, text, val...
          if(! it.attrs[ arr[1] ] ) it.attrs[ arr[1] ] = [];

          //@TODO: 可优化，编译模板
          it.attrs[ arr[1] ].push(
            (function(node, funcName){
              return function(value) {
                node[funcName](value);
              };
            })( $(node), arr[0] )
          );
        }

      });
    });
  },


  // Initialize is an empty function by default. Override it with your own
  // initialization logic.
  initialize: function() {}

});

// Set up inheritance for the VM
// Similar to `goog.inherits`, but uses a hash of prototype properties and
// class properties to be extended.
VM.extend = Backbone.Model.extend;

// Return a CMD module from seajs,
// It must be loaded after backbone.js
module.exports = Backbone;
