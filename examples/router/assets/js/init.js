/*global seajs*/
// seajs configure
seajs.config({
  debug: true,
  base:'../../',
  alias: {
    "jquery":　"jquery/1.10.2/jquery",
    "backbone": "backbone/1.1.2/backbone",
    "underscore": "underscore/1.6.0/underscore",
    "backbone.vm": "backbone.vm"
  }
});

// start app init
seajs.use("./assets/js/router.js?nowrapper");