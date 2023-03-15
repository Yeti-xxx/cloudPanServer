const db = require('../db/mysql')
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