/*global $,seajs,define,document,localStorage,window,APP */
/*jshint unused:false */
define(function(require, exports, module){
  "use strict";
  var VM = require("backbone.vm");

  var C = VM.extend({
    el: "#panel-c",
    defaults: {
      welcome: "here is panel c"
    }
  });

  new C();
});