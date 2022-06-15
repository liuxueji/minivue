class Vue {
  constructor(options) {
    this.$options = options
    this.$watchEvent = {}
    if (typeof options.beforeCreate == 'function') {
      options.beforeCreate.call(this)
    }
    this.$data = options.data
    if (typeof options.created == 'function') {
      options.created.call(this)
    }
    if (typeof options.beforeMount == 'function') {
      options.beforeMount.call(this)
    }
    this.$el = document.querySelector(options.el)
    if (typeof options.mounted == 'function') {
      options.mounted.call(this)
    }
    // 模板解析
    this.Parser(this.$el)
    // 数据劫持
    this.proxy()
    // 劫持data中的数据
    this.observe()
  }
  // 劫持data中的数据，当data数据发生变化，就调用watch中的update
  observe() {
    for (let key in this.$data) {
      let value = this.$data[key]
      let that = this
      Object.defineProperty(this.$data, key, {
        get() {
          return value
        },
        set(val) {
          console.log('改变了');

          value = val
          if (that.$watchEvent[key]) {
            that.$watchEvent[key].forEach(item => {
              item.update()
            })
          }
        }
      })
    }
  }
  // 解析模板函数
  Parser(node) {
    node.childNodes.forEach(item => {
      // 元素节点
      if (item.nodeType == 1) {
        // 判断元素节点是否有@click
        if (item.hasAttribute('@click')) {
          // 获取@click节点绑定的事件名
          let value = item.getAttribute('@click').trim()
          // 为存在@click的节点，添加事件
          item.addEventListener('click', (e) => {
            //执行事件，修改this指向当前对象，并传递e
            this.$options.methods[value].bind(this)(e)
          })
        }
        // 双向绑定，判断元素节点是否被包含v-model
        if(item.hasAttribute('v-model')){
          // 获取属性名为v-model对应的属性值，去除两边空格
          let vmKey = item.getAttribute('v-model').trim()
          // 判断当前节点中是否包含属性值(例：message)，即data中是否有message属性，这里的this是vue对象
          // 问题：获取不到data中的message，只能获取到data中$data下的message ，这里不太理解
          // console.log(this,vmKey,this[vmKey],this.$data[vmKey])            
          if(this.$data.hasOwnProperty(vmKey)){
            // data中对应的值取出来，赋值给当前节点的value中
            item.value = this.$data[vmKey]    
          }
          // 为节点添加事件，将input中的value赋值给data中的message，此时就能实现双向绑定了
          item.addEventListener('input',e => {
            this[vmKey] = item.value         
          })
        }
        // 递归执行模板解析        
        this.Parser(item)
      }
      // 文本节点
      if (item.nodeType == 3) {
        let reg = /\{\{(.*?)\}\}/g
        let text = item.textContent
        item.textContent = text.replace(reg, (match, vmKey) => {
          vmKey = vmKey.trim()
          // 判断视图中是否有vmKey，vmKey就是message、name这些
          // 对象vm、data中的属性名、node节点、属性名
          let watcher = new Watch(this, vmKey, item, 'textContent')
          // 判断对象中是否有视图中文本对应属性
          if (this.$watchEvent[vmKey]) {
            this.$watchEvent[vmKey].push(watcher)
          } else {
            this.$watchEvent[vmKey] = []
            this.$watchEvent[vmKey].push(watcher)
          }

          return this.$data[vmKey]
        })
      }
    })
  }
  // 数据劫持
  proxy() {
    // 循环$data中的属性值
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
}

// 创建Watch构造函数
class Watch {
  constructor(vm, key, node, attr) {
    this.vm = vm
    this.key = key
    this.node = node
    this.attr = attr
  }
  // 执行改变操作
  update() {
    console.log(this.key);

    this.node[this.attr] = this.vm[this.key]
  }
}