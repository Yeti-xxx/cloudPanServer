const express = require('express')
const router = express.Router()
const UserHandler = require('../handler/userHandler')

// 注册功能
router.post('/regUser',UserHandler.regUser)

module.exports = router