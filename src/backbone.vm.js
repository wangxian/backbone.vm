//  Backbone.vm.js 1.0.0

//  (c) 2013-2014 wangxian, DocumentCloud and Investigative Reporters & Editors
//  Backbone may be freely distributed under the MIT license.
//  For all details and documentation:
//  http://github.com/wangxian/backbone.vm

var $        = require("jquery");
var _        = require("underscore");
var Backbone = require("backbone");

// List of view options to be merged as properties.
var vmOptions = ["el", "defaults"];

// Cached regex for stripping vm node attributes. space, \r \n
var vmAttrStripper = /\s+/g;

// for:stuct replace && clear template string
// var forTplReplaceStripper = /<!--|-->|\n|'|{|}/g;

// for:struct match dom bind setting string
// var forTplOnStripper = /on:(\w+)=(\w+)/g;


// Handle all struct vm attribute tags,
// eg: html, text, on...
var VMhooks = {
  // VM->DOM, text, html, val...
  simple: function($node, funcName, filters) {
    return function(str) {
      _.each(filters, function(filter){ str = filter(str); });
      $node[funcName](str);
    };
  },

  // DOM->VM, INPUT(except checkbox/radio) on change
  simpleOnChange: function(vm, name) {
    return function() { vm.set(name, this.value); };
  },

  // Show/Hide HTML element if vm item is true or false
  show: function($node) {
    return function(isShow) { $node[isShow?'show':'hide'](); };
  },

  // Remove HTML element if vm item value is true
  remove: function($node) {
    return function(isRemoved) { if(isRemoved) $node.remove(); };
  },

  // DOM->VM, checkbox on click
  checkboxOnClick: function(vm, name) {
    return function() {
      var checkboxList = vm.get(name);
      var checked = this.checked;
      var value   = this.value;
      if(! _.isArray(checkboxList)) checkboxList = [];
      // if(_.contains(checkboxList, this.value)) {
      //   if(this.checked)
      // }
      if(!checked){
        checkboxList = _.filter(checkboxList, function(num){ return num !== value; });
      } else {
        checkboxList.push(value);
      }
      vm.set(name, checkboxList);
    };
  },

  // VM->DOM, radio
  // Handle input radio
  radio: function(radios) {
    return function(value) {
      value = value.toString();
      for(var r in radios) {
        if(r !== value) {
          radios[r].checked = false;
        } else {
          radios[r].checked = true;
        }
      }
    };
  },

  // VM->DOM, checkbox
  // Handle input checkbox
  checkbox: function(checkboxes) {
    return function(arr) {
      if(! _.isArray(arr)) return;
      for(var r in checkboxes) {
        if(! _.contains(arr, r) ) {
          checkboxes[r].checked = false;
        } else {
          checkboxes[r].checked = true;
        }
      }
    };
  },

  // Bind html dom Event to VM function
  bindEventListener: function(vmObj, funcName){
    if(typeof vmObj[funcName] === "function") {
      return _.bind(vmObj[funcName], vmObj);
    }
    return function(){};
  },

  //
  // , function(e, id) {
  // }
  /**
   * Bind for:struct each item delete element
   * @param Object vmObj    vm object
   * @param String funcName bind function name in vm object
   * @param String itemKey bind current item vm key
   * @param Object $el root each item of jquery node wrapper
   */
  bindForListener: function(vmObj, funcName, itemKey, $el){
    if(typeof vmObj[funcName] === "function") {
      return function(e) {
        _.bind(vmObj[funcName], vmObj)( e, itemKey, $el );
      };
    } else {
      return function(){};
    }
  },

  forTemplate: function(vmObj, $node) {
    // Only match comments in for:struct
    var tpl = $node.html().match(/<!--([\s\S]*)-->/g);
    tpl = tpl !== null ? tpl[0].replace(/<!--|-->/g, "") : "";
    // console.log(tpl);

    // By default, Underscore uses ERB-style template delimiters, change the
    // following template settings to use alternative delimiters.
    // _.templateSettings = {
    //   evaluate    : /<%([\s\S]+?)%>/g,
    //   interpolate : /<%=([\s\S]+?)%>/g,
    //   escape      : /<%-([\s\S]+?)%>/g,
    //   variable    : "data"
    // };

    // @todo: underscore >= 1.7.0, _.template accept 2 args
    var render = _.template(tpl);

    // 传入 vmItemVal 为变化的 vm 数组项的值
    return function(vmItemVal) {
      // console.log("re render for:struct")

      // Before re-render for vm's view, clean older dom
      $node.empty();

      var args = _.clone(vmObj._filter);
      _.each(vmItemVal, function(value, key) {
          args.$key = key;
          args.$value = value
          // console.log(args);

          var $itemNode = $(render(args));
          $node.append($itemNode);

          // Fixed: 如果 for 模板里没有最外层的包装时，$(x) 是一个数组
          $itemNodeHasVM = $itemNode.length > 1 ? $itemNode.filter("[vm]") : $itemNode.find("[vm]")

          // 绑定for:struct循环中的事件绑定
          $itemNodeHasVM.each(function(k, nodeHasVmAttr){
            $nodeHasVmAttr = $(nodeHasVmAttr);
            var vmNodeAttrList = nodeHasVmAttr.getAttribute("vm").replace(vmAttrStripper, "").split(",");
            _.each(vmNodeAttrList, function(v){
              var arr   = v.split(":");
              var ev    = arr[1].split("=");
              // console.log(ev);
              if(arr[0] === "on") {
                // VMhooks.bindForListener()
                $nodeHasVmAttr.on(ev[0], VMhooks.bindForListener(vmObj, ev[1], key, $itemNode));
              }
            });
          });
      });
    };

  }

};

// Create a plugin from backbone.js, Similar usage and backbone.view
var VM = Backbone.VM = function(options) {
  this.cid = _.uniqueId('vm');
  if(!options) { options = {}; }
  _.extend(this, _.pick(options, vmOptions));
  _.extend(this._filter, this.filter);

  this.$el = $(this.el);
  this._vm  = new Backbone.Model();

  this._scanAttrs();

  // this._vm.on("all", function(){
  //   console.log(arguments);
  // });
  this._vm.on("change", this._updateVM, this);
  this.initialize.apply(this, arguments);
  this._vm.set(this.defaults);
};

_.extend(VM.prototype, {

  // Set default vm scope,
  // When user's app not defined, set the defulat el 'body'
  el: "body",

  // Wrapper el using jQuery
  $el: null,

  // Store the relationship between Dom and model
  // eg, { "nickname":[ function(){}, .... ]}
  _attrs: {},

  // Default VM value
  defaults: {},

  // jQuery delegate for element lookup, scoped to DOM elements within the
  // current view. This should be preferred to global lookups where possible.
  $: function(selector) {
    return this.$el.find(selector);
  },

  // Store filter function
  _filter: {
    uppercase: function(str) { return str.toUpperCase(); },
    lowercase: function(str) { return str.toLowerCase(); },
    json: function(obj, pretty) { return JSON.stringify(obj, null, pretty ? '  ' : null); }
  },

  // Initialize is an empty function by default. Override it with your own
  // initialization logic.
  initialize: function() {},

  // VM's model, Your app can use it to set VM value
  // eg, this._vm.set("name", "tom")
  _vm: null,

  // Store input[type=radio] & input[type=checkbox] bind data
  input: {
    radio: {},
    checkbox: {}
  },

  // Update VM bind node when vm model is updated
  _updateVM: function(model) {
    // console.info("model updated:", model.changed, model.toJSON());
    var attrs = _.pick(this._attrs, _.keys(model.changed));
    // console.log(attrs);
    _.each(attrs, function(v, k){
      _.each(v, function(func){
        func(model.get(k));
      });
    });
  },

  // Scan html dom attribute contains vm="*"
  _scanAttrs: function() {
    var it = this;
    this.$el.find("[vm]").each(function(k, node){
      // VM HTML DOM node
      var vmNodeAttrList   = node.getAttribute("vm").replace(vmAttrStripper, "").split(",");
      _.each(vmNodeAttrList, function(v){
        var arr = v.split(":");
        var vmKey = arr[0];
        var vmFilters = arr[1].split("|");
        var vmVal     = vmFilters.shift();
        // console.log(vmKey, arr[1]);

        if(vmKey === "on") {
          var ev = vmVal.split("=");
          // console.log(ev);
          // add vm-dombind attribute, for unload vm, vm.destory()
          $(node).on( ev[0], VMhooks.bindEventListener(it, ev[1]) ).attr("vm-dombind", "");
        } else if(vmKey === "show") {
          it._attrs[ vmVal ] = [ VMhooks.show( $(node) ) ];
        } else if(vmKey === "remove") {
          it._attrs[ vmVal ] = [ VMhooks.remove( $(node) ) ];
        } else if(vmKey === "for") {
          // for:struct 处理逻辑

          if(! it._attrs[ vmVal ] ) it._attrs[ vmVal ] = [];
          it._attrs[ vmVal ].push( VMhooks.forTemplate( it, $(node) ) );

        } else {
          // Simple VM Bind VM -> DOM, for: text, val <-> vm model
          if(! it._attrs[ vmVal ] ) it._attrs[ vmVal ] = [];
          if(node.type === "radio" || node.type === "checkbox") {
            if(! it.input[node.type][vmVal] ) {
              // When it.input.[node.type][vmVal] is empty
              // input.[node.type] like { "age":{"1": Node }}
              var ri = {};
              ri[ node.value ] = node;
              it.input[node.type][ vmVal ] = ri;
              // console.log(it.input[node.type]);

              it._attrs[ vmVal ].push( VMhooks[node.type]( it.input[node.type][ vmVal ]) );
            } else {
              // input[node.type] like { "age":{"1": Node }}
              it.input[node.type][ vmVal ][node.value] = node;
            }
          } else {
            // contains: remove, html, text...

            // 支持 filter 功能，之前把 filter 准备好，做好调用 filter 的准备
            var filters = _.map(vmFilters, function(filter){
              var filterArgs = filter.split("#");
              var filterName = filterArgs.shift();
              return function(obj){
                var args = filterArgs.concat();
                args.unshift(obj);
                if(it._filter[filterName]) {
                  return it._filter[filterName].apply(null, args);
                } else if( _[filterName] ) {
                  // 支持，直接调用 underscore.js 作为 filter
                  return _[filterName].apply(null, args);
                }
              }
            });
            // console.log(filters);

            // 新增：第三个参数，filters, 例如: [function(obj){ }, ...]
            it._attrs[ vmVal ].push( VMhooks.simple( $(node), vmKey, filters ) );
          }

          // form Bind DOM -> VM, for: input on change
          if( (node.nodeName === "INPUT" || node.nodeName === "SELECT") && vmKey === "val") {
            if(node.type === "radio") {
              $(node).on("click", VMhooks.simpleOnChange( it, vmVal ) ).attr("vm-dombind", "");
            } else if(node.type === "checkbox"){
              $(node).on("click", VMhooks.checkboxOnClick( it, vmVal ) ).attr("vm-dombind", "");
            } else {
              $(node).on("change", VMhooks.simpleOnChange( it, vmVal ) ).attr("vm-dombind", "");
            }
          }
        }

      });
    });
  },

  // get value from this._vm
  get: function(key){
    return this._vm.get(key);
  },

  // Add a new method to Backbone.Model.prototype
  // support update model every time
  // support vm.update("userlist[0].name") using namespace
  set: function(key, value, options) {
    if(typeof options === "undefined") options = {};
    var silent = options.silent;

    if(typeof key === "object") {
      this._vm.set(key, options);
    } else {
      var firstKeyPos = key.search(/\[|\./);

      if(firstKeyPos === -1) {
        this._vm.set(key, value, options);
      } else {
        // previous vm data
        this._vm._previousAttributes = _.clone(this._vm.attributes);

        var newKey   = key;
        var key      = newKey.slice(0, firstKeyPos);
        var lastKey  = newKey.slice(firstKeyPos);
        var itemObj  = this._vm.attributes[key];

        var source = 'obj'+ lastKey +'=value;';
        try {
          var execValue = new Function("obj,value", source);
          execValue(itemObj, value);

          var changed = {};
          changed[key] = value;
          this._vm.changed = changed;
          if(!silent) this._vm.trigger("change:"+ key, this._vm);
          if(!silent) this._vm.trigger("change", this._vm);
        } catch(e) {
          // var e = ex;
          throw new Error("update "+ key + lastKey+" error, source="+ source);
        }
      }
    }
  },

  // Rewrite：
  // Model 的 Events 方法
  on: function(event, callback, context) { if(!context) context = this; this._vm.on(event, callback, context); },
  off: function(event, callback, context) { if(!context) context = this; this._vm.off(event, callback, context); },
  once: function(event, callback, context) { if(!context) context = this; this._vm.once(event, callback, context); },
  trigger: function() { this._vm.on.apply(this._vm, arguments); },


  // 把  VM 转换为 JSON 对象
  toJSON: function() {
    return this._vm.toJSON();
  },

  // destory VM object when a new vm is not used
  // clear vm variable, unbind dom delegate
  // @todo ...
  destroy: function() {
    this._vm.off(null, null, this);
    this.$el.find("[vm-dombind]").off();
    this.$el    = null;
    this._vm    = null;
    this._attrs = null;
    this.input  = null;
  }

});

// Set up inheritance for the VM
// Similar to `goog.inherits`, but uses a hash of prototype properties and
// class properties to be extended.
VM.extend = Backbone.Model.extend;

// Return a CMD module from seajs,
// It must be loaded after backbone.js
module.exports = VM;
