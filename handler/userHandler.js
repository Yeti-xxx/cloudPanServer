const db = require('../db/mysql')
const path = require('path')
const fs = require("fs");
const util = require('util');

// 导入token生成
const { createToken, verifyToken } = require('../utils/createToken')
// 将db.query 装饰为Promis的方法
const query = util.promisify(db.query).bind(db);

// 获取用户信息
exports.getUserInfo = async (req, res) => {
    const token = req.headers.token
    const user = verifyToken(token);
    // 过期处理
    if (parseInt(Date.now() / 1000) > parseInt(user.exp)) {
        return res.send({ code: 401, message: '请重新登录' })
    }
    const userSql = 'select * from cloud_userinfo where userId = ?'
    try {
        const resSql = await query(userSql, user.userId)
        if (resSql.length !== 1) {
            return res.send({ code: 403, message: "获取失败" })
        }
        res.send({ code: 200, message: '获取用户信息成功', data: resSql[0] })
    } catch (error) {
        return res.send({ code: 500, message: "服务器异常" })
    }

}

// 修改用户头像
exports.updateAvatar = async (req, res) => {
    // // // 提取token
    let avtarPath = 'http://127.0.0.1:5007/cloudAvatar/'
    const token = req.headers.token
    const user = verifyToken(token);
    // 过期处理
    if (parseInt(Date.now() / 1000) > parseInt(user.exp)) {
        return res.send({ code: 401, message: '请重新登录' })
    }
    // 寻找之前的头像并删除
    const getPreAvatarSql = 'select avatar from cloud_userinfo where userId = ?'
    // 切割使用的数组
    let arr = []
    // 数据库中获取的url赋值给它
    let PreAvatarUrl = null
    try {
        // 删除之前的头像
        const resSql = await query(getPreAvatarSql, [user.userId])
        PreAvatarUrl = resSql[0].avatar + ''
        if (PreAvatarUrl.indexOf('cube.elemecdn') == -1) {
            arr = PreAvatarUrl.split('/').slice(3)
            PreAvatarUrl = `/public/${arr[0]}/${arr[1]}`
            fs.unlink(path.join(process.cwd(), PreAvatarUrl), (err) => {
                if (err) return res.send({ code: 500, message: '服务器异常' });
            })
        }
    } catch (error) {
        return res.send({ code: 500, message: '服务器异常' })
    }


    // 先保存图片，再从数据库中记录
    try {
        const fileBody = req.files.file
        const fileType = fileBody.path.split('.')[fileBody.path.split('.').length - 1]    //获取文件类型
        const fileName = user.username + 'Avatar.' + fileType    //拼接成文件名字 yetixxAvatar.png
        // 拼接文件所在位置
        avtarPath += fileName
        // // 读取图片
        const img = fs.createReadStream(req.files.file.path)
        const nono = fs.createWriteStream(path.join(process.cwd(), '/public/cloudAvatar/' + fileName))
        img.pipe(nono)  //这一步就是管道流传输
    } catch (error) {
        res.send({ code: 500, message: '服务器异常' })
    }
    const updateAvatarSql = 'update cloud_userinfo set avatar = ? where userId = ?'
    try {
        const resSql = await query(updateAvatarSql, [avtarPath, user.userId])
        res.send({ code: 200, message: '成功' })
    } catch (error) {
        return res.send({ code: 500, message: '服务器异常' })
    }
}

// 查询QuickPan自带的所有头像
exports.getQuickPanAvatar = async (req, res) => {
    const QPAvatarSql = 'select * from quickpan_avatar'
    let AvatarArr = []
    try {
        const resSql = await query(QPAvatarSql)
        AvatarArr = [...resSql]
        res.send({ code: 200, message: '成功', data: AvatarArr })
    } catch (error) {
        return res.send({ code: 500, message: '服务器异常' })
    }

}