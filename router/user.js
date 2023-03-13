const express = require('express')
const router = express.Router()
const UserHandler = require('../handler/userHandler')

// 注册功能
router.post('/regUser',UserHandler.regUser)
// 登录功能
router.post('/login',UserHandler.login)
module.exports = router