//  Backbone.vm.js 1.0.0

//  (c) 2013-2014 wangxian, DocumentCloud and Investigative Reporters & Editors
//  Backbone may be freely distributed under the MIT license.
//  For all details and documentation:
//  http://github.com/wangxian/backbone.vm

var $ = require("jquery");
var _ = require("underscore");
var Backbone = require("backbone");

// List of view options to be merged as properties.
var vmOptions = ["el", "defaults"];

// Cached regex for stripping vm node attributes. space, \r \n
var vmAttrStripper = /\s+/g;

// Handle all struct vm attribute tags,
// eg: html, text, on...
var VMhooks = {
  // VM->DOM, text, html...
  simple: function(node, funcName) {
    return function(str) { node[funcName](str); };
  },

  // DOM->VM, INPUT on change
  simpleOnChange: function(model, name) {
    return function() { model.set(name, this.value); };
  },

  // handle input radio
  radio: function(radios) {
    return function(value) {
      value = value.toString();
      for(var r in radios) {
        if(r !== value) {
          radios[r].checked = false;
        } else {
          radios[r].checked = true;
        }
      }
    };
  }

};

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

  // Store input[type=radio] bind data
  inputRadio: {},

  // Store input[type=checkbox] bind data
  inputCheckbox: {},

  // Scan html dom attribute contains vm="*"
  scanAttrs: function() {
    var it = this;
    this.$el.find("[vm]").each(function(k, node){
      // VM HTML DOM node
      var vmNodeEl   = node.getAttribute("vm").replace(vmAttrStripper, "").split(",");
      var vmNodeName = node.nodeName;
      _.each(vmNodeEl, function(v){
        var arr = v.split(":");
        var vmKey = arr[0];
        var vmVal = arr[1];
        if(vmKey === "on") {

        } else if(vmKey === "show") {

        } else if(vmKey === "for") {

        } else {
          // Bind VM -> DOM, for: text, val <-> vm model
          if(! it.attrs[ vmVal ] ) it.attrs[ vmVal ] = [];
          if(node.type !== "radio") {
            it.attrs[ vmVal ].push( VMhooks.simple( $(node), vmKey ) );
          } else {
            if(! it.inputRadio[vmVal] ) {
              // inputRadio like { "age":{"1": Node }}
              var ri = {};
              ri[ node.value ] = node;
              it.inputRadio[ vmVal ] = ri;
              // console.log(it.inputRadio);

              it.attrs[ vmVal ].push( VMhooks.radio( it.inputRadio[ vmVal ]) );
            } else {
              // inputRadio like { "age":{"1": Node }}
              it.inputRadio[ vmVal ][node.value] = node;
            }
          }

          // Bind DOM -> VM, for: input on change
          if( (vmNodeName === "INPUT" || vmNodeName === "SELECT") && vmKey === "val") {
            if(node.type !== "radio") {
              $(node).on("change", VMhooks.simpleOnChange( it.vm, vmVal) );
            } else {
              $(node).on("click", VMhooks.simpleOnChange( it.vm, vmVal) );
            }
          }
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
