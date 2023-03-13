// 导入jwt
const jwt = require('jsonwebtoken')
const Signature = 'I_LOVE_JING'
// 生成Token
exports.createToken = function(obj){
    const token = jwt.sign(obj,Signature,{expiresIn:60*60*24*7})    //七天token
    return token
}
// 验证Token
exports.verifyToken = function(token){
    return jwt.verify(token,Signature)
}