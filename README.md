# backbone.vm.js

---

[![spm version](http://spmjs.io/badge/backbone.vm)](http://spmjs.io/package/backbone.vm)

A VM plugin for Backbone.js

---

## Install

```
$ spm install backbone.vm --save
```

## Usage

定义一个HTML，内容如下：

```html
<div id="main">
  <form action="">
    <label for="name">请输入姓名：</label>
    <input id="name" type="text" name="name" 
           vm="val:name, on:change=updateMe, on:click=showTips" />
    您的姓名为：<span vm="html:name"></span>
  </form>
</div>
```

app.js 的内容：

```js
// use backbone.vm
var MainApp = Backbone.VM.extend({

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
    this.vm.set("name", "xxxxx");
  }
  
  
});

```


## Support struct tags

使用方法，再html标签上添加，vm="x:y", 如果有多个使用逗号分割，  
详细的使用方法，可参考examples目录中的例子。

支持的所有的标签功能:

### html 
使用 jQuery html() 读写节点内容

### text
使用 jQuery text() 读写节点内容

### css
绑定值的css属性列表，修改html style节点属性


### val
读写from input的值

### show
是否显示显示 html 元素标签, 

如果绑定的值 !!variable 是`true` 显示 `false` 隐藏

### on
绑定HTML dom Event，用法，on:click=xxxFunc


### for
循环显示数据， 如：

```html
// 假如
var userlist = [
  {"name": "antoy", "age": 22},
  {"name": "tom", "age": 23}
];

<ul vm="for:userlist">
  <!-- 
  <li>
    <p>索引：{$key}</p>
    <p>姓名：{$value.name}</p>
    <p>年龄：{$value.age}</p>
  </li>
  -->
</ul>
```

userlist 可以是 array 或 json object，如果是array key为数字索引，  
如果是 object， 则key为object key索引。




