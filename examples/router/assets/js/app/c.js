define(function(require, exports, module){
  var VM = require("backbone.vm");
  var C = VM.extend({
    el: "#page-c",
    defaults: {
      welcome: "here is panel c"
    }
  });

  new C();
});