/*global $,seajs,define,document,localStorage,window,APP */
/*jshint unused:false */
define(function(require){
  "use strict";

  var VM = require("backbone.vm");
  var A = VM.extend({
    el: "#panel-a",

    filters: { a: function(){} },

    defaults: {
      welcome: "here is panel a"
    }

  });
  new A();
});