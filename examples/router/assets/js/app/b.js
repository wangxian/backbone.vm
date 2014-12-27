/*global $,seajs,define,document,localStorage,window,APP */
/*jshint unused:false */
define(function(require, exports, module){
  "use strict";
  var VM = require("backbone.vm");

  var B = VM.extend({
    el: "#panel-b",
    defaults: {
      welcome: "here is panel b"
    }
  });

  window.b = new B();
  // console.dir(b);
});