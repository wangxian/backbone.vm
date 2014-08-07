# Demo

---

<style>
.demo { padding: 10px; background-color: #efefef; }  
</style>

<div id="main">
  <form action="">
    <h3><label for="name">请输入姓名：</label><h3>
    <p>
      <input id="name" type="text" name="name" 
             vm="val:name, on:change=updateMe, on:click=showTips" />
    </p>
    
    <h3>您的姓名为：</h3>
    <p vm="html:name">--</p>
    <p vm="text:name">--</p>
    
  </form>
</div>

<script>
define("main", function(require, exports, module){
  var $        = require("jquery");
  var Backbone = require("backbone.vm");
  
  // for test
  window.$ = $;
  window.Backbone = Backbone;
  
  console.dir(new (Backbone.VM.extend({"id":12})) )
  
  // console.log(jQuery);
  
  

  // var MainApp = Backbone.VM.extend({

  //   // Bind Dom id, Control of the scope of the VM
  //   // So, you can define some VM object
  //   el: "#main",
    
  //   // At initialization we do something
  //   initialize: function() {
  //     // do something...
  //   },
    
  //   // when vm.name changed
  //   updateMe: function() {
    
  //   },
    
  //   // when input[name] click, do this function
  //   showTips: function(e) {
  //     // modify name's value
  //     this.vm.set("name", "xxxxx");
  //   }
  // });
  
  
});

seajs.use("main");
</script>