/*global $,seajs,define */
/*jshint unused:false */
var APP = {};

// seajs configure
seajs.config({
  debug: true,
  base:'../../',
  alias: {
    "jquery":　"jquery/1.10.2/jquery",
    "backbone": "backbone/1.1.2/backbone",
    "underscore": "underscore/1.6.0/underscore",
    "backbone.vm": "src/backbone.vm"
  }
});

// start app init
seajs.use("./assets/js/router.js?nowrapper");