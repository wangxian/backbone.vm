# Demo

---

<style>
.demo { padding: 10px; background-color: #efefef; }  
</style>

<div id="main">
  <form action="">
    <h3><label for="nickname">请输入姓名：</label><h3>
    <p>
      <input id="nickname" type="text" name="nickname" 
            vm="val:nickname, 
                 on:change=updateMe, 
                 on:click=showTips" />
    </p>
    
    <h3>您的姓名为：</h3>
    
    1. 使用html绑定
    <p vm="html:nickname">--</p>
    
    2. 使用text绑定
    <p vm="text:nickname">--</p>
    
  </form>
</div>

<script>
define("main", function(require, exports, module){
  var $        = require("jquery");
  var Backbone = require("src/backbone.vm");
  
  // for test
  window.$ = $;
  window.Backbone = Backbone;
  
  // console.dir(new (Backbone.VM.extend({"id":12})) )
  
  // console.log(jQuery);
  
  var MainApp = Backbone.VM.extend({
    
    // default vm value
    defaults: {
      "nickname": "<b>antony</b>",
      "friends" : ["sa", "sb", "sc"]
    },

    // Bind Dom id, Control of the scope of the VM
    // So, you can define some VM object
    el: "#main",
    
    // At initialization we do something
    initialize: function() {
      // do something...
    },
    
    // when vm.name changed
    updateMe: function() {
    
    },
    
    // when input[name] click, do this function
    showTips: function(e) {
      // modify name's value
      this.vm.set("name", "antony");
    }
  });
  
  // init new MainApp
  window.mainapp = new MainApp();
  
  
});

seajs.use("main");
</script>