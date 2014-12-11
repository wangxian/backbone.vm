define(function(require, exports, module){
  var VM = require("backbone.vm");
  var A = VM.extend({
    el: "#page-a",
    filter: {
      a: function(){}
    },
    defaults: {
      welcome: "here is panel a"
    }
  });
  window.a = new A();
  console.dir(a);
});