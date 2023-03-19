const express = require('express')
const userRouter = express.Router()
const UserHandler = require('../handler/userHandler')
// 解析multiparty
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();

// 获取用户信息
userRouter.get('/getUserInfo', UserHandler.getUserInfo)

// 更新用户头像
userRouter.post('/updateAvatar', multipartMiddleware, UserHandler.updateAvatar)

// 获取QuickPan头像
userRouter.get('/quickPanAvatar',UserHandler.getQuickPanAvatar)

module.exports = userRouter
