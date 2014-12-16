/*global $,seajs,define,document,window,APP */
/*jshint unused:false */
define(function(require, exports, module){
  var VM = require("backbone.vm");
  var MainVM = VM.extend({
    el: "#todoapp",

    filter: {
      selected: function(value, action) {
        // console.log(APP.router.action,action);
        if(APP.router.action === action) return "selected";
        else return "";
      }
    },

    defaults: {
      title: "",
      remaining: 0,
      completed: 0,

      // 被选中的filter样式
      className: "selected",
      todos: []
    },

    initialize: function() {
      APP.router.on("refresh", this.refresh, this);
      this.refresh("default");

      // this.on("change:todos", function(){
      //   console.log(this, this.get("todos"));
      // });
    },

    // 刷新数据
    refresh: function(action) {

    },

    // 输入进行时
    onKeypress: function(e) {
      if(e.which === 13) {
        this.set("title", e.target.value);
        this.get("todos").push({title: e.target.value, completed: false});
        this.trigger("change:todos");
        e.target.value = "";
      }
    },

    // 删除一项 todo
    deleteIt: function() {

    },

    // 清除所有已完成的todos
    clearCompletedTodos: function() {

    },

    // 页面 filter 那个被选中
    // @todo 这里是一个丑陋的实现，后续解决
    chkFilter: function(e) {
      this.$(e.target).parent().parent().find("a").removeClass("selected");
      e.target.className = "selected";
    }


  });

  APP.mainvm = new MainVM();
});