define(function(require, exports, module){
  var VM = require("backbone.vm");
  var B = VM.extend({
    el: "#page-b",
    defaults: {
      welcome: "here is panel b"
    }
  });
  window.b = new B();
  // console.dir(b);
});