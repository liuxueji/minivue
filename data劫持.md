### 介绍

`Object.defineProperty(obj,prop,descriptor)` 用法介绍：

- 参数

  - `obj`:要定义属性的对象。

  - `prop`:要定义或修改的属性的名称

  - `descriptor`:要定义或修改的属性描述符。
- 描述符值汇总
  - `configurable`：当且仅当该属性的 `configurable` 键值为 `true` 时，该属性的描述符才能够被改变，同时该属性也能从对应的对象上被删除。
    默认为 `false`。
  - `enumerable`：属性为`true`时，属性才会出现在对象中的枚举属性中
  - `value`：属性对应的值
  - `get`：属性的 `getter` 函数，如果没有 `getter`，则为 `undefined`。当访问该属性时，会调用此函数。执行时不传入任何参数，但是会传入 `this` 对象
  - `set`：属性的 `setter` 函数，如果没有 `setter`，则为 `undefined`。当属性值被修改时，会调用此函数。该方法接受一个参数（也就是被赋予的新值），会传入赋值时的 `this` 对象。
  - `writable`：当属性的值为`true`时，属性的值才能被修改


什么是数据劫持？

数据劫持，指用户操作数据时，通过代码进行拦截，然后在用户操作的基础上，再添加一些额外的操作

在`Vue`中，数据劫持就是用过`Object.defineProperty`中的`getter`和`setter`实现的，当数据发生改变，就通知`Vue`调用`getter`和`setter`方法，对数据做进一步处理。



### 实现

在上一篇文章中，我们已经能通过`this`获取到`Vue`对象了，但是不能获取`this`中指定的属性

![image-20220606090925976](https://liuxueji.oss-cn-guangzhou.aliyuncs.com/image-20220606090925976.png)

![image-20220606090858325](https://liuxueji.oss-cn-guangzhou.aliyuncs.com/image-20220606090858325.png)



![image-20220606090937748](https://liuxueji.oss-cn-guangzhou.aliyuncs.com/image-20220606090937748.png)

![image-20220606090949110](https://liuxueji.oss-cn-guangzhou.aliyuncs.com/image-20220606090949110.png)

当我们打印`this.message`时，输出的时`undefined`，原因是因为`this`里面没有`message`，`message`只存在于`data`中

所以，我们需要将`data`中的数据，复制到`vue`对象中，像这样：

![image-20220606091501814](https://liuxueji.oss-cn-guangzhou.aliyuncs.com/image-20220606091501814.png)

并且，还要让`data`中的数据，和`Vue`对象中的数据，保存同步更新，例如：`this.$data.message`改变为`'hello'`，`this.message`也要改变为`'hello'`

这里就需要用到`Object.defineProperty()`，进行数据劫持，`Object.defineProperty()`的使用上面已经介绍过了

我们需要实现的两个功能：

- 将`data`中的属性值，赋值给`vue`对象
- `data`中的属性值，和`vue`对象中的属性值，保存同步更新

> 思路：通过循环`$data`中的属性值，并设置`get`和`set`，对数据进行劫持

代码

```
   constructor(options) {
   ...
    // 数据劫持
    this.proxy()
  } 
  // 数据劫持
  proxy() {
    for (let key in this.$data) {
      Object.defineProperty(this, key, {
        get() {
          return this.$data[key]
        },
        set(value) {
          this.$data[key] = value
        }
      })
    }
  }
```

![image-20220606093038130](https://liuxueji.oss-cn-guangzhou.aliyuncs.com/image-20220606093038130.png)

并且可以获取到`this.message`



当我们对值进行修改时，`vue`对象中的值也会跟着改变

```
      methods: {
        handle(e) {
          this.message = 'hellow'
          console.log(this)          
        }
      }
```

点击前![image-20220606110712692](https://liuxueji.oss-cn-guangzhou.aliyuncs.com/image-20220606110712692.png)

点击后![image-20220606110723826](https://liuxueji.oss-cn-guangzhou.aliyuncs.com/image-20220606110723826.png)

可以看出，当我们修改`this.message`中属性值时，`this.$data.message`也会跟着改变

到这里，我们就已经完成了`data`劫持了

但是，模板中还没有响应式更新，在下一篇文章会讲 `vue`中视图更新



### 总结

实现`data`劫持，需要完成两个功能：

- 将`data`中的属性值，赋值给`vue`对象
- `ata`中的属性值，和`vue`对象中的属性值，保存同步更新

实现的方法是通过`Object.defineProperty`中的`get`和`set`进行数据劫持
