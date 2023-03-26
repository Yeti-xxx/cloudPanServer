const db = require('../db/mysql')
const path = require('path')
const fs = require("fs");
const util = require('util');
// 导入一个hash生成工具
const crypto = require('crypto');
// 导入token生成
const { createToken, verifyToken } = require('../utils/createToken')
// 将db.query 装饰为Promis的方法
const query = util.promisify(db.query).bind(db);
// 导入配置文件
const filesDeploy = require('../utils/filesDeploy')

exports.uploadFiles = async (req, res) => {
    // 验证操作
    const BasePath = filesDeploy.BasePath;
    let tokenStr = null
    let user = null
    try {
        tokenStr = req.headers.token
        user = verifyToken(tokenStr);
    } catch (error) {
        res.send({ code: 401, message: '请重新登录！' })
    }
    if (req.body.type === 'init') {   // 请求类型为上传分片
        /*
            createTime:创建时间
            size:文件大小
            fileName:文件名
            filetype：文件类型
        */
        const { createTime, size, fileName, filetype } = req.body
        let path = `${BasePath}/${user.userId}/${fileName}_${filetype}`;
        // 判断是否存在该目录
        if (!fs.existsSync(path)) {
            // 不存在则直接创建
            fs.mkdir(path, { recursive: true }, (err) => {
                if (err) {
                    console.error(err);
                    return res.send({ code: 500, message: "服务器异常" })
                }
            });
        } else {
            const uniqueHash = crypto.createHash('sha256').update(Math.random().toString()).digest('hex').slice(0, 10);
            path = `${BasePath}/${user.userId}/${fileName}_${filetype}_${uniqueHash}`
            fs.mkdir(path, { recursive: true }, (err) => {
                if (err) {
                    console.error(err);
                    return res.send({ code: 500, message: "服务器异常" })
                }
            });
        }
        try {
            const initSql = 'insert into cloud_files (userId,filename,size,type,path,created_at) value (?,?,?,?,?,?)'
            const resSql = await query(initSql, [user.userId, fileName, size, filetype, path, createTime])
            res.send({code:200,message:"初始化完成"})
        } catch (error) {
            console.log(error);
            return res.send({ code: 500, message: "服务器异常" })
        }


    }
    res.send('ok!')

}