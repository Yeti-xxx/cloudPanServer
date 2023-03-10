const db = require('../db/mysql')
const bcryptjs = require('bcryptjs')


// 注册功能
exports.regUser = (req, res) => {
    const regBody = req.body
    console.log(regBody);
    const regPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/    //八个字符，至少一个字母和一个数字
    const regUserName = /^[a-zA-Z0-9_-]{4,8}$/
    if (!regPassword.test(regBody.password) || !regUserName.test(regBody.username)) {
        return res.send({ code: '403', message: '用户名或密码不合法' })
    } else {
        // const password = bcryptjs.hashSync(regBody.password,10)
        const sqlCheckUsername = 'select * from cloud_login where username=?'
        try {
            db.query(sqlCheckUsername, regBody.username, (err, resSql) => {
                if (err) {
                    return res.send(err)
                } else if (resSql.length > 0) {
                    return res.send({ code: '403', message: "用户名已存在" })
                } else {
                    const insertUser = 'insert into cloud_login (username,password) values (?,?)'
                    const bcryptPassword = bcryptjs.hashSync(regBody.password,10)
                    db.query(insertUser, [regBody.username, bcryptPassword], (err, resInsert) => {
                        if (err) {
                            return res.send(err)
                        }
                        if (resInsert.affectedRows !== 1) {
                            return res.send({ code: '403', message: "注册失败" })
                        }
                        res.send({code: '200', message: "注册成功" })
                    })
                }
            })
        } catch (error) {
            console.log(error);
        }

    }

}
