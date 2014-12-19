//  Backbone.vm.js 1.2.0

//  (c) 2013-2014 wangxian, DocumentCloud and Investigative Reporters & Editors
//  Backbone may be freely distributed under the MIT license.
//  For all details and documentation:
//  http://github.com/wangxian/backbone.vm

var $        = require("jquery");
var _        = require("underscore");
var Backbone = require("backbone");

// Cached regex for stripping vm node attributes. space, \r \n
var vmAttrStripper = /\s+/g;

// for:stuct replace && clear template string
// var forTplReplaceStripper = /<!--|-->|\n|'|{|}/g;

// for:struct match dom bind setting string
// var forTplOnStripper = /on:(\w+)=(\w+)/g;


// Handle all struct vm attribute tags,
// eg: html, text, on...
var VMhooks = {
  // VM->DOM, text, html, val, css
  simple: function($node, vmKey, filters) {
    return function(value) {
      _.each(filters, function(filter){ value = filter(value); });
      $node[vmKey](value);
    };
  },

  // DOM->VM, INPUT(except checkbox/radio) on change
  simpleOnChange: function(vm, name) {
    return function() { vm.set(name, this.value); };
  },

  // Show/Hide HTML element if vm item is true or false
  show: function($node) {
    return function(value) { $node[value ? 'show' : 'hide'](); };
  },

  // Remove HTML element if vm item value is true
  remove: function($node) {
    return function(value) { if(!!value) $node.remove(); };
  },

  // VM->DOM Set or clear Element's classList
  className: function($node, vmVal, filters) {
    return function(value, vm) {
      var oldValue;
      _.each(filters, function(filter){ value = filter(value); });
      if(!_.isArray(value)) { oldValue = vm.previous(vmVal);}
      else {
        // 支持从filter定义类切换，如 [之前的类， 新类名称]
        oldValue = value[0];
        value    = value[1];
      }
      if(!!oldValue) { $node.removeClass(oldValue); }
      if(!!value) { $node.addClass(value); }
    };
  },

  // DOM->VM, checkbox on click
  checkboxOnClick: function(vm, name) {
    return function() {
      var checkboxList = vm.get(name);
      var value   = this.value;
      if(! _.isArray(checkboxList)) checkboxList = [];

      if(!this.checked){
        checkboxList = _.filter(checkboxList, function(num){ return num !== value; });
      } else {
        checkboxList.push(value);
      }
      vm.set(name, checkboxList, {silent: true});

      // 修复 Model 触发 change 事件的要求
      var changed;
      (changed = {})[name] = checkboxList;
      vm._vm.changed = changed;

      vm.trigger("change:"+name);
    };
  },

  // VM->DOM, checkbox
  // Handle input checkbox
  checkbox: function(checkboxes) {
    return function(value) {
      if(! _.isArray(value)) return;
      for(var r in checkboxes) {
        if(! _.contains(value, r) ) {
          checkboxes[r].checked = false;
        } else {
          checkboxes[r].checked = true;
        }
      }
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

  // Bind html dom Event to VM function
  bindEventListener: function(vm, funcName){
    if(typeof vm[funcName] === "function") {
      return _.bind(vm[funcName], vm);
    }
    return function(){};
  },

  /**
   * Bind for:struct each item delete element
   * callback function(e, key, $el) {}
   * @param Object vm vm object
   * @param String funcName bind function name in vm object
   * @param String itemKey bind current item vm key
   * @param Object $el root each item of jquery node wrapper
   */
  bindForListener: function(vm, funcName, itemKey, $el){
    if(typeof vm[funcName] === "function") {
      return function(e) {
        _.bind(vm[funcName], vm)( e, itemKey, $el );
      };
    } else {
      return function(){};
    }
  },

  // vm-for compile and render
  forTemplate: function($node, filters) {
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

    // 传入 value 为变化的 vm 数组项的值
    return function(value, vm) {
      // Before re-render for vm's view, clean older dom
      $node.empty();

      // support filters
      _.each(filters, function(filter){ value = filter(value); });

      var args = _.clone(vm._filter);
      _.each(value, function(v, key) {
        args.$key = key;
        args.$value = v;
        // console.log(args);

        var $rootNode = $(render(args));
        $node.append($rootNode);

        // Fixed: 如果 for 模板里没有最外层的包装时，$(x) 是一个数组
        var $nodesHasVM = $rootNode.length > 1 ? $rootNode.filter("[vm]") : $rootNode.find("[vm]");

        // 绑定for:struct循环中的事件绑定
        $nodesHasVM.each(function(k, nodeHasVM){
          var nodes = nodeHasVM.getAttribute("vm").replace(vmAttrStripper, "").split(",");
          _.each(nodes, function(v){
            var arr   = v.split(":");
            var ev    = arr[1].split("=");
            // console.log(ev);
            if(arr[0] === "on") {
              $(nodeHasVM).on(ev[0], VMhooks.bindForListener(vm, ev[1], key, $rootNode));
            }
          });
        });

      });
    };
  },

  // Parse html-dom-vm filter list
  parseFilter: function(vm, vmFilters) {
    return _.map(vmFilters, function(filter){
      var filterArgs = filter.split("#");
      var filterName = filterArgs.shift();
      return function(obj){
        // shadow copy filterArgs
        var args = filterArgs.concat();
        args.unshift(obj);
        if(vm._filter[filterName]) {
          return vm._filter[filterName].apply(vm, args);
        } else if( _[filterName] ) {
          // 支持，直接调用 underscore.js 作为 filter
          return _[filterName].apply(null, args);
        }
      };
    });
  }

};

// Create a plugin from backbone.js, Similar usage like backbone.view
var VM = Backbone.VM = function(options) {
  this.cid = _.uniqueId('vm');
  if(!options) { options = {}; }
  this._filter = _.extend({}, this._filterDefault, this.filter);

  // Store the relationship between Dom and model
  // eg, { "nickname":[ function(){}, .... ]}
  this._attrs = {};

  // Store input[type=radio] & input[type=checkbox] bind data
  this._input = { radio: {}, checkbox: {} };

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

  // Default VM value
  defaults: {},

  // jQuery delegate for element lookup, scoped to DOM elements within the
  // current view. This should be preferred to global lookups where possible.
  $: function(selector) {
    return this.$el.find(selector);
  },

  // Store filter function
  _filterDefault: {
    uppercase: function(str) { return str.toUpperCase(); },
    lowercase: function(str) { return str.toLowerCase(); },
    json: function(obj, pretty) { return JSON.stringify(obj, null, pretty ? '  ' : null); }
  },

  // Initialize is an empty function by default. Override it with your own
  // initialization logic.
  initialize: function() {},

  // Update VM bind node when vm model is updated
  _updateVM: function(model) {
    // console.info("model.changed:", model.changed, model.toJSON());
    var attrs = _.pick(this._attrs, _.keys(model.changed));
    var it = this;
    _.each(attrs, function(v, k){
      _.each(v, function(func){ func(model.get(k), it); });
    });
  },

  // Scan html dom attribute contains vm="*"
  _scanAttrs: function() {
    var it = this;
    this.$el.find("[vm]").each(function(k, node){
      var _attrs = node.getAttribute("vm").replace(vmAttrStripper, "");
      if(!_attrs) return;
      var _attrsList = _attrs.split(",");
      _.each(_attrsList, function(v) {
        var arr   = v.split(":");
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
        } else if(vmKey === "class") {
          if(! it._attrs[ vmVal ] ) it._attrs[ vmVal ] = [];
          it._attrs[ vmVal ].push( VMhooks.className( $(node), vmVal, VMhooks.parseFilter(it, vmFilters) ) );
        } else if(vmKey === "for") {
          if(! it._attrs[ vmVal ] ) it._attrs[ vmVal ] = [];
          it._attrs[ vmVal ].push( VMhooks.forTemplate( $(node), VMhooks.parseFilter(it, vmFilters) ) );
        } else if( _.contains(["html", "text", "val", "css"], vmKey) ) {
          if(! it._attrs[ vmVal ] ) it._attrs[ vmVal ] = [];

          if(node.type === "radio" || node.type === "checkbox") {
            if(! it._input[node.type][vmVal] ) {
              // When it._input.[node.type][vmVal] is empty
              // input.[node.type] like { "age":{"1": Node }}
              var ri = {};
              ri[ node.value ] = node;
              it._input[node.type][ vmVal ] = ri;
              // console.log(it._input[node.type]);

              it._attrs[ vmVal ].push( VMhooks[node.type]( it._input[node.type][ vmVal ]) );
            } else {
              // input[node.type] like { "age":{"1": Node }}
              it._input[node.type][ vmVal ][node.value] = node;
            }
          } else {
            // 支持 filter 功能，之前把 filter 准备好，做好调用 filter 的准备
            // console.log( VMhooks.parseFilter(it, vmFilters) );
            // 新增：第三个参数，filters, 例如: [function(obj){ }, ...]
            it._attrs[ vmVal ].push( VMhooks.simple( $(node), vmKey, VMhooks.parseFilter(it, vmFilters) ) );
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
    var unset  = options.unset;

    if(typeof key === "object") {
      this._vm.set(key, options);
    } else {
      var firstKeyPos = key.search(/\[|\./);
      if(firstKeyPos === -1) {
        var forceChange = false;
        if(!this._vm._changing && typeof value === "object") {
          options.silent = true;
          forceChange = true;
        }
        this._vm.set(key, value, options);
        if(forceChange) this.trigger("change:"+ key);
      } else {
        var newKey   = key;
        key = newKey.slice(0, firstKeyPos);

        var lastKey  = newKey.slice(firstKeyPos);
        var itemObj  = this._vm.attributes[key];

        var source = "";
        if(!unset) source = 'obj'+ lastKey +'=value;';
        else {
          var lastKeyPos = Math.max(lastKey.lastIndexOf("."), lastKey.lastIndexOf("["));
          var lastFrameBefore = lastKey.slice(0, lastKeyPos);

          // 只有父节点类型是数组的时候才使用
          var lastFrameEnd = lastKey.slice(lastKeyPos+1, -1);
          // console.log(key, lastFrameBefore, ">>>>>",lastKey, lastFrameEnd);
          source = 'if(Object.prototype.toString.call(obj'+ lastFrameBefore +') === "[object Array]"){ obj'+ lastFrameBefore +'.splice('+ lastFrameEnd +',1); }else{ delete obj'+ lastKey +';}';
          // console.log(source);
        }


        try {
          var execValue = new Function("obj,value", source);
          execValue(itemObj, value);

          // previous vm data
          this._vm._previousAttributes = _.clone(this._vm.attributes);

          var changed = {};
          changed[key] = value;
          this._vm.changed = changed;
          if(!silent) { this.trigger("change:"+ key); }
        } catch(e) {
          // var e = ex;
          throw new Error("update "+ key + lastKey+" error, source="+ source);
        }
      }
    }
    return this;
  },

  // Remove an attribute from the VM
  unset: function(attr, options) {
    options = _.extend({}, options, {unset: true});
    return this.set(attr, null, options);
  },

  // Rewrite：
  // Model 的 Events 方法
  on: function(event, callback, context) { if(!context) context = this; this._vm.on(event, callback, context); },
  off: function(event, callback, context) { if(!context) context = this; this._vm.off(event, callback, context); },
  once: function(event, callback, context) { if(!context) context = this; this._vm.once(event, callback, context); },
  previous: function(attr) { return this._vm.previous(attr); },

  // 重写 Backbone.Events 触发事件
  trigger: function(ev) {
    var args = [this._vm].concat([].slice.call(arguments, 1));
    var ea = ev.split(":");
    if(ea[0] === "change") {
      if(ea.length === 2) {
        // console.log([ev].concat(args));
        this._vm.trigger.apply(this._vm, [ev].concat(args));

        // 为了触发 change 事件
        this._vm.changed = _.pick(this._vm.attributes, ea[1]);
        ev = ea[0];
      } else if(ea.length === 1) {
        this._vm.changed = this._vm.attributes;
      }
    }
    // console.log([ev].concat(args));
    this._vm.trigger.apply(this._vm, [ev].concat(args));
  },

  // 把 VM 转换为 JSON 对象
  toJSON: function() {
    return this._vm.toJSON();
  },

  // destory VM object when a new vm is not used
  // clear vm variable, unbind dom delegate
  // @todo ...
  destroy: function() {
    this._vm.off(null, null, this);
    this.$el.find("[vm-dombind]").off();
    this.$el     = null;
    this._vm     = null;
    this._attrs  = null;
    this._input  = null;
  }
});

// Set up inheritance for the VM
// Similar to `goog.inherits`, but uses a hash of prototype properties and
// class properties to be extended.
VM.extend = Backbone.Model.extend;

// Return a CMD module from seajs,
// It must be loaded after backbone.js
module.exports = VM;
