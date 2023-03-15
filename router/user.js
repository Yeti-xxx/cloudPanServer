const express = require('express')
const userRouter = express.Router()
const UserHandler = require('../handler/userHandler')

// 获取用户信息
userRouter.get('/getUserInfo',UserHandler.getUserInfo)
module.exports = userRouter