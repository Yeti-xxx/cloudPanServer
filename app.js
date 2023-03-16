// 导入 express
const express = require('express')
// 创建服务器的实例对象
const app = express()
// 导入test路由
const routerTest = require('./test/index')
// 导入login.js路由
const loginRouter = require('./router/login')
// 导入user.js路由
const userRouter = require('./router/user')
// 引入跨域插件
const cors = require('cors'); 
// 引入body-parser 处理Body
const bodyParser = require('body-parser')
// 导入path
const path = require('path')
app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));
// 托管图片资源
app.use('/cloudAvatar',express.static('./public/cloudAvatar'))
app.use('/test',routerTest)
app.use('/cloud',loginRouter)
app.use('/api',userRouter)
app.listen(5007, () => {
    console.log('api server running at http://127.0.0.1:5007')
})
