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
    if (req.body.type === 'init') {   // 请求类型为初始化
        /*
            createTime:创建时间
            size:文件大小
            fileName:文件名
            filetype：文件类型
        */
        const { createTime, size, fileName, filetype, totalChunk } = req.body
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
            // 如果目录存在则文件名后添加一个hash值创建目录
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
            // 执行插入语句
            const chunkArray = ([]).toString()
            const initSql = 'insert into cloud_files (userId,filename,size,type,path,created_at,currentChunk,totalChunk) value (?,?,?,?,?,?,?,?)'
            const resSql = await query(initSql, [user.userId, fileName, size, filetype, path, createTime, chunkArray, totalChunk])
            res.send({ code: 200, message: "初始化完成" })
        } catch (error) {
            console.log(error);
            return res.send({ code: 500, message: "服务器异常" })
        }


    }
    if (req.body.type === 'upload') {
        // 解构参数
        try {
            const { index, name, totalLength, Filetype } = req.body
            // 获取目录和进度数组
            const getSaveSql = 'select currentChunk,path,created_at from cloud_files where userId = ? and fileName = ? and type = ?'
            const getSaveRes = await query(getSaveSql, [user.userId, name, Filetype])
            const dir = getSaveRes[0].path  //获取目录
            const chunkArray = getSaveRes[0].currentChunk.split(',') //获取分片进度数组
            const token = getSaveRes[0].created_at

            const chunkFile = req.files.chunk
            const chunkName = chunkFile.path.split('/').pop()
            const fileRes = filesDeploy.renameFileAndMove(dir, chunkName, `${name}-${index}-${token}`)
            if (!fileRes.over) {
                return res.send({ code: 500, message: "服务器异常" })
            }
            //更新数据库中的分片进度数组，如果已经存在则跳过
            if (chunkArray.includes(index)) {
                return res.send('ok!')
            }
            // 数组更新后再存储回去
            chunkArray.push(index)
            const updateArraySql = 'update cloud_files set currentChunk = ? where userId = ? and fileName = ? and type = ?'
            const updateRes = await query(updateArraySql, [chunkArray.toString(), user.userId, name, Filetype])
            if (updateRes.affectedRows !== 1) {
                return res.send({ code: 500, message: "服务器异常" })
            }
            return res.send('upload ok!')
        } catch (error) {
            return res.send({ code: 500, message: error.message })
        }

    }
    if (req.body.type === 'merge') {
        try {
            // 解构参数
            const { fileName, chunkCount, Filetype } = req.body
            // // 获取目录和进度数组
            const getSaveSql = 'select currentChunk,path,created_at from cloud_files where userId = ? and fileName = ? and type = ?'
            const getSaveRes = await query(getSaveSql, [user.userId, fileName, Filetype])
            const dir = getSaveRes[0].path  //获取目录
            const fileToken = getSaveRes[0].created_at
            await filesDeploy.mergeChunkFile(fileName, dir, chunkCount, fileToken)
            const updateOverSql = 'update cloud_files set isUploadOver = ? where userId = ? and fileName = ? and type = ?'
            const updateOverRes = await query(updateOverSql, [0, user.userId, fileName, Filetype])
            return res.send({ code: 200, message: 'merge ok' })
        } catch (error) {
            console.log(error);
            return res.send({ code: 500, message: error.message })
        }
    }

}

// 验证文件完整性
exports.verifyFile = async (req, res) => {
    // 验证操作
    const BasePath = filesDeploy.BasePath;
    let tokenStr = null
    let user = null
    try {
        tokenStr = req.headers.token
        user = verifyToken(tokenStr);
        const { FileType, FileName } = req.body
        // 获取目录和进度数组
        const getSaveSql = 'select totalChunk,currentChunk,path,created_at from cloud_files where userId = ? and fileName = ? and type = ?'
        const getSaveRes = await query(getSaveSql, [user.userId, FileName, FileType])
        const chunkArray = getSaveRes[0].currentChunk.split(',')
        chunkArray.shift()
        const totalChunk = getSaveRes[0].totalChunk     //获取总数量
        const totalChunkArray = fillArray(totalChunk)   //填充完整的数组
        const resArray = difference(chunkArray, totalChunkArray)
        return res.send({ code: 200, message: 'verifyFile ok', data: { resArray } })
    } catch (error) {
        res.send({ code: 401, message: '请重新登录！' })
    }

}


// 数组填充
function fillArray(n) {
    var arr = []; // 创建一个空数组
    for (var i = 0; i <= n; i++) {
        arr.push(i + ''); // 在数组末尾添加元素
    }
    return arr; // 返回填充的数组
}

// 数组对比并过滤存在的元素
function difference(chunkArray, totalChunkArray) {
    console.log(chunkArray);
    console.log(totalChunkArray);
    const diff = totalChunkArray.reduce((acc, val) => {
        if (!chunkArray.includes(val)) {
            acc.push(val)
        }
        return acc
    }, [])
    console.log(diff);
    return diff
}

// 获取用户所有的文件资源信息
exports.getFiles = async (req, res) => {
    try {
        let tokenStr = null
        let user = null
        tokenStr = req.headers.token
        user = verifyToken(tokenStr);
        console.log(user);
        const getFilesSql = 'select * from cloud_files where userId = ?'
        const getFilesRes = await query(getFilesSql, [user.userId])
        res.send({ code: 200, message: 'getFiles ok', data: { FilesInfo: getFilesRes } })
    } catch (error) {
        console.log(error.message); 
        res.send({ code: 401, message: '请重新登录！' })
    }


}