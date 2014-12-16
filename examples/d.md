# simple-demo
- order: 5
-------------------------

````html
<div id="main">
  <p>请输入姓名：</p>
  <p><input id="nickname" type="text" name="nickname" vm="val:nickname" /></p>
  <p>您的姓名为：<em vm="html:nickname"></em></p>
</div>
````

<script src="../spm_modules/seajs/2.3.0/dist/sea.js?nowrapper"></script>
````javascript
seajs.config({base:'../'});
seajs.use(['jquery/1.10.2/jquery.js','src/backbone.vm'], function($, VM){
  var MainVM = VM.extend({
    // Bind Dom id, Control of the scope of the VM
    // So, you can define some VM object
    el: "#main",

    // default vm value
    defaults: {
      nickname: "Nicholas C.Zakas"
    }
  });

  new MainVM();
});
````