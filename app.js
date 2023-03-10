// 导入 express
const express = require('express')
// 创建服务器的实例对象
const app = express()
// 导入test路由
const routerTest = require('./test/index')
// 导入user.js路由
const userRouter = require('./router/user')
// 引入跨域插件
const cors = require('cors'); 
// 引入body-parser 处理Body
const bodyParser = require('body-parser')
app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/test',routerTest)
app.use('/cloud',userRouter)
app.listen(5007, () => {
    console.log('api server running at http://127.0.0.1:5007')
})
