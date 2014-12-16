"use strict";
/*global define, document*/
define(function(require){
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
      this.dispatch("a");
    },

    // default action
    action: "a",

    // Dispatch pannels
    dispatch: function(action) {
      var it = this;
      require.async("./app/" + action +".js?nowrapper", function() {
        if(it.action === action) return;

        it.panel.filter(".on").fadeOut(100, function(){
          $(this).removeClass("on");
          it.panel.filter('#page-' + action).fadeIn(300, function(){
            $(this).addClass('on');
          });
        });

        it.action = action;
      });
    },
    goto: function(action) {
      this.navigate('#/' + action, { trigger: true });
    }
  });

  // start when domready
  $(document).ready(function(){ new R(); Backbone.history.start(); });
});