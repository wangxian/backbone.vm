"use strict";
/*global define*/
/*jshint unused:true*/
define(function(require){
  var VM = require("backbone.vm");
  var A = VM.extend({
    el: "#page-a",
    filters: {
      a: function(){}
    },
    defaults: {
      welcome: "here is panel a"
    }
  });
  new A();
  // console.dir(a);
});