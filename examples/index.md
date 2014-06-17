# Demo

---

<style>
.demo { padding: 10px; background-color: #efefef; }  
</style>

## Support tag
- <!\-\- name \-\->
- vm-val="var"
- vm-html="var"
- vm-text="var"
- vm-if="expr"
- vm-foreach="Object|Array"
- vm-show="expr"
- vm-class="expr"
- vm-css="expr"
- vm-attr="var"
- vm-on="(click, fn)"
- ...


<div id="container" vm-controller="box1">
  <h3>demo1:</h3>
  <div class="demo">
    <div>Your name is <strong><!-- name -->jake</strong></div>
    <p>Please input your name: </p>
    <p><input type="text" vm-val="name" value="jake" /></p>
  </div>
</div>

<script type="text/javascript">
// make test
seajs.use('backbone.vm', function(vm) {

});  
  
</script>