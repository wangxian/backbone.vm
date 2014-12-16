/*global $,seajs,define,document,APP */
/*jshint unused:false */
define(function(require){
  "use strict";
  var $        = require("jquery");
  var Backbone = require("backbone");

  var R = Backbone.Router.extend({
    routes: {
      "": "default",
      ":action": "dispatch"
    },

    initialize: function() {
      this.panel = $('.panel');
    },

    default: function() {
      this.dispatch(this.action);
    },

    // default action
    action: "index",

    // Dispatch pannels
    dispatch: function(action) {
      this.action = action;
      this.trigger("refresh", action);
    },

    goto: function(action) {
      this.navigate('#/' + action, { trigger: true });
    }
  });

  // start when domready
  $(document).ready(function(){
    APP.router = new R();
    Backbone.history.start();
    require.async("./app.js?nowrapper");
  });
});