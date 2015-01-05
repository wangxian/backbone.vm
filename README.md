# backbone.vm

---

[![spm version](http://spmjs.io/badge/backbone.vm.js)](http://spmjs.io/package/backbone.vm.js)

A MVVM plugin for backbone.js

---

## Introduction

- 让 Backbone 支持 MVVM
- 轻量体积（压缩后<2k）
- 兼容主流浏览器（IE6+, Chrome, Safari, Firefox ...）
- 十分钟快速上手


## Install

```
$ spm install backbone.vm --save
```

## Dependencies

- Backbone.js 1.0+
- Underscore.js or Lo-Dash
- jQuery1.x or jQuery 2.x or Zepto.js

## Usage

定义一个HTML，内容如下：

```html
<div id="main">
  <form action="">
    <p>
      <label for="nickname">请输入姓名：</label>
      <input id="nickname" type="text" name="nickname" vm="val:nickname" />
    </p>
    <p>您的姓名为：<span vm="text:nickname"></span></p>
  </form>
</div>
```

app.js 的内容：

```js
// use MVVM
var MainVM = VM.extend({

  // Bind Dom id, Control of the scope of the VM
  // So, you can define some VM object
  el: "#main",

  // default vm value
  defaults: {
    "nickname": "Nicholas C.Zakas"
  },

});

$(document).ready(function(){
  new MainVM();
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

### class
设置或取消绑定的 className

### val
读写from input的值

### show
是否显示显示 html 元素,

如果绑定的值 !!variable 是`true` 显示 `false` 隐藏

### remove
移除 DOM 元素

### on
绑定HTML dom Event，用法，on:click=customFuncName

### for
循环显示数据，如：

```html
// 假如
var userlist = [
  {"name": "antoy", "age": 22},
  {"name": "lucy",   "age": 23}
];

<ul vm="for:userlist">
  <!--
  <li>
    <p>索引：<%= $key %></p>
    <p>姓名：<%= $value.name %></p>
    <p>年龄：<%= $value.age %></p>
  </li>
  -->
</ul>
```

userlist 可以是 array 或 json object，如果是array key为数字索引，
如果是 object， 则key为object key索引。



## Others

更多用法，请参考 [demos](examples/index.html) 示例。
