const express = require('express')
const filesRouter = express.Router()
const filesHandler = require('../handler/filesHandler')
// 解析multiparty
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();

filesRouter.post('/uploadFiles',multipartMiddleware,filesHandler.uploadFiles)
filesRouter.post('/verifyFile',filesHandler.verifyFile)
filesRouter.get('/getFiles',filesHandler.getFiles)

module.exports = filesRouter