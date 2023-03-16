const db = require('../db/mysql')
const path = require('path')
const fs = require("fs");
const multipart = require('connect-multiparty');
// 导入token生成
const { createToken, verifyToken } = require('../utils/createToken')

exports.getUserInfo = (req, res) => {

    const token = req.headers.token
    const user = verifyToken(token);
    // 过期处理
    if (parseInt(Date.now() / 1000) > parseInt(user.exp)) {
        return res.send({ code: 401, message: '请重新登录' })
    }

    const userSql = 'select * from cloud_userinfo where userId = ?'
    db.query(userSql, user.userId, (err, resSql) => {
        if (err) {
            return res.send({ code: 500, message: "服务器异常" })
        }
        if (resSql.length !== 1) {
            return res.send({ code: 403, message: "获取失败" })
        }
        res.send({ code: 200, message: '获取用户信息成功', data: resSql[0] })
    })
}

exports.updateAvatar = (req, res) => {
    // 提取token
    let avtarPath = 'http://127.0.0.1:5007/cloudAvatar/'
    const token = req.headers.token
    const user = verifyToken(token);
    // 过期处理
    if (parseInt(Date.now() / 1000) > parseInt(user.exp)) {
        return res.send({ code: 401, message: '请重新登录' })
    }
    // 先保存图片，再从数据库中记录
    try {
        const fileBody = req.files.file
        const fileType = fileBody.path.split('.')[fileBody.path.split('.').length - 1]    //获取文件类型
        const fileName = user.username + 'Avatar.' + fileType    //拼接成文件名字 yetixxAvatar.png
        // 拼接文件所在位置
        avtarPath += fileName   //http://127.0.0.1:5007/cloudAvatar/yetixxAvatar.png
        // // 读取图片
        const img = fs.createReadStream(req.files.file.path)
        const nono = fs.createWriteStream(path.join(process.cwd(), '/public/cloudAvatar/' + fileName))
        img.pipe(nono)  //这一步就是管道流传输
    } catch (error) {
        res.send({code:500,message:'服务器异常'})
    }
    const updateAvatarSql = 'update cloud_userinfo set avatar = ? where userId = ?'
    db.query(updateAvatarSql,[avtarPath,user.userId],(err,res)=>{
        if (err) {
            return res.send({code:500,message:'服务器异常'})
        }
    })
    res.send({ code: 200, message: '成功' })

}