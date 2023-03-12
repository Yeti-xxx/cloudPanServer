const db = require('../db/mysql')
const bcryptjs = require('bcryptjs')
// 导入正则
const { regPassword, regUserName } = require('../utils/regExp')
// 导入userId生成
const { createId } = require('../utils/createUserId')


// 注册功能
exports.regUser = (req, res) => {
    const regBody = req.body
    const userId = createId(regBody.username)
    console.log(regBody);
    if (!regPassword.test(regBody.password) || !regUserName.test(regBody.username)) {
        return res.send({ code: '403', message: '用户名或密码不合法' })
    } else {
        // const password = bcryptjs.hashSync(regBody.password,10)
        const sqlCheckUsername = 'select * from cloud_login where username=?'
        try {
            db.query(sqlCheckUsername, regBody.username, (err, resSql) => {
                if (err) {
                    return res.send({ code: '500', message: "服务器异常" })
                } else if (resSql.length > 0) {
                    return res.send({ code: '403', message: "用户名已存在" })
                } else {
                    const insertlogin = 'insert into cloud_login (username,password,userId) values (?,?,?)'
                    const bcryptPassword = bcryptjs.hashSync(regBody.password, 10)
                    db.query(insertlogin, [regBody.username, bcryptPassword, userId], (err, resInsert) => {
                        if (err) {
                            return res.send(err)
                        }
                        if (resInsert.affectedRows !== 1) {
                            return res.send({ code: '403', message: "注册失败" })
                        }
                        // res.send({ code: '200', message: "注册成功" })
                        const insertUserInfo = 'insert into cloud_userInfo (userId,nickname) value (?,?)'
                        db.query(insertUserInfo, [userId, regBody.username], (err, resInsert) => {
                            if (err) {
                                return res.send(err)
                            }
                            if (resInsert.affectedRows !== 1) {
                                return res.send({ code: '403', message: "注册失败" })
                            }
                            res.send({ code: '200', message: "注册成功" })
                        })
                    })


                }
            })
        } catch (error) {
            res.send({ code: '500', message: "服务器异常" })
        }

    }

}
