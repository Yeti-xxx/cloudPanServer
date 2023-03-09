// 导入 express
const express = require('express')
// 创建服务器的实例对象
const app = express()
// 导入test路由
const routerTest = require('./test/index')
// 引入跨域插件
const cors = require('cors'); 
app.use(cors());
app.use('/test',routerTest)

app.listen(5007, () => {
    console.log('api server running at http://127.0.0.1:5007')
})
