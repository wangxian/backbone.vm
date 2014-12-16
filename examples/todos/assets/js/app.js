/*global $,seajs,define,document,localStorage,window,APP */
/*jshint unused:false */
define(function(require, exports, module){
  var VM = require("backbone.vm");
  var _  = require("underscore");
  var $  = require("jquery");

  // Generate four random hex digits.
  function S4() {
     return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  }

  // Generate a pseudo-GUID by concatenating random hexadecimal.
  function guid() {
     return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
  }

  var MainVM = VM.extend({
    el: "#todoapp",

    filter: {
      selected: function(value, action) {
        if(APP.router.action === action) return ["selected", "selected"];
        else return ["selected", ""];
      },

      complex: function(value) {
        return value>1 ? value + " items left" : value +" item left";
      },

      filter: function(value) {
        var action = APP.router.action;
        if(action === "active") {
          return _.filter(value, function(v){ return v.completed === false; });
        } else if(action === "completed") {
          return _.filter(value, function(v){ return v.completed === true; });
        } else {
          return value;
        }
      }
    },

    defaults: {
      remaining: 0,
      completed: 0,

      // 被选中的filter样式
      selectedClass: "selected",
      todos: []
    },

    initialize: function() {
      this.defaults.todos = JSON.parse( localStorage.getItem("todos") || '[]' );

      APP.router.on("refresh", this.refresh, this);
      this.refresh("default");

      this.on("change:todos", this.resetStatus);
    },

    // 重置统计状态
    resetStatus: function(){
      var todos = this.get("todos");
      var remaining = _.filter(todos, function(v){ return v.completed === false; }).length;
      this.set("remaining", remaining);
      this.set("completed", todos.length - remaining);

      localStorage.setItem("todos", JSON.stringify(todos));
    },

    // 刷新数据
    refresh: function(action) {
      this.trigger("change:todos");
      this.trigger("change:selectedClass");
    },

    // 输入进行时
    onKeypress: function(e) {
      if(e.which === 13) {
        this.set("title", e.target.value);
        this.get("todos").push({_id: guid(), title: e.target.value, completed: false});
        this.trigger("change:todos");
        e.target.value = "";
      }
    },

    // 删除一项 todo
    deleteIt: function(e, key) {
      var todos = this.get("todos");
      var todo = this.filter.filter(todos)[key];
      todos = _.filter(todos, function(v){ return v._id !== todo._id; });
      this.set("todos", todos);
    },

    // set the todo completed=true
    toggleCompleted: function(e, key) {
      var todos = this.get("todos");
      var todo = this.filter.filter(todos)[key];
      _.each(todos, function(v){ if(v._id === todo._id) v.completed = !v.completed; });
      this.trigger("change:todos");
    },

    // set all todos complated
    toggleAllComplete: function() {
      var todos = this.get("todos");
      _.each(todos, function(todo){ todo.completed = true; });
      this.set("todos", todos);
      this.trigger("change:todos");
    },

    // 清除所有已完成的todos
    clearCompletedTodos: function() {
      var todos = this.get("todos");
      todos = _.filter(todos, function(v){ return v.completed === false; });
      this.set("todos", todos);
      this.trigger("change:todos");
    },

    // 双击进入编辑模式
    onEnterItem: function(e) {
      this.$(e.target).parent().parent().addClass("editing");
      this.$(e.target).parent().parent().find(".edit").focus();
    },

    // 编辑输入模式
    onEditItem: function(e, key) {
      var todos = this.get("todos");
      var todo = this.filter.filter(todos)[key];
      if(e.which === 13) {
        _.each(todos, function(v){ if(v._id === todo._id) v.title = e.target.value; });
        this.trigger("change:todos");
        this.$(e.target).parent().removeClass("editing");
      }
    }
  });

  APP.mainvm = new MainVM();
});