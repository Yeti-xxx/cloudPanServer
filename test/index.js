const express = require('express')
const db = require('../db/mysql')
const routerTest = express.Router()
const fs = require('fs');
const path = require('path');
const app = express();
// 解析multiparty
const multipart = require('connect-multiparty');
const { Blob } = require('buffer');
const multipartMiddleware = multipart();

routerTest.get('/hi', (req, res) => {
    const sql = 'select * from testDB'
    db.query(sql, (err, resdb) => {
        if (err) {
            return console.log(err);
        }
        res.send(resdb[0].test)
    })

})
const uploadChunkPath = 'E:/uploadTest';
routerTest.post('/upload', multipartMiddleware, async (req, res) => {
    if (req.body.type === 'merge') {
        const { token, chunkCount, fileName } = req.body
        await mergeChunkFile(fileName, uploadChunkPath, chunkCount, token)
        res.send('ok')
    } else if (req.body.type === 'upload') {
        const { index, token, name } = req.body
        const chunkFile = req.files.chunk
        const chunkName = chunkFile.path.split('/').pop()
        renameFile(uploadChunkPath, chunkName, `${name}-${index}-${token}`)
        res.send('upload chunk success')
    } else {
        res.send('error')
    }


})
// 合并块函数
const mergeChunkFile = async (fileName, chunkPath, chunkCount, fileToken, dataDir = "./") => {
    //如果chunkPath 不存在 则直接结束
    if (!fs.existsSync(chunkPath)) return
    const dataPath = path.join(uploadChunkPath, fileName); //路径拼接
    console.log(dataPath);
    let writeStream = fs.createWriteStream(dataPath);   //创建Stream流
    let mergedChunkNum = 0
    return mergeCore()
    //闭包保存非递归数据
    function mergeCore() {
        //结束标志为已合并数量大于总数（mergedChunkNum从0开始）
        if (mergedChunkNum >= chunkCount) {
            // const overFile = fs.createReadStream(path.join(__dirname, "./", fileName))
            // const nono = fs.createWriteStream(path.join(uploadChunkPath, fileName))
            // overFile.pipe(nono) //完成后移动文件
            return  writeStream.end()
        }
        const curChunk = path.resolve(chunkPath, `${fileName}-${mergedChunkNum}-${fileToken}`)
        const curChunkReadStream = fs.createReadStream(curChunk)    //创建读取流
        curChunkReadStream.pipe(writeStream, { end: false }); //走管道 end = false 则可以连续给writeStream 写数据
        curChunkReadStream.on("end", () => {
            //readStream 传输结束 则 递归 进行下一个文件流的读写操作
            fs.unlinkSync(curChunk) //删除chunkFile
            mergedChunkNum += 1
            mergeCore();
        });
    }

}

//文件重命名
function renameFile(dir, oldName, newName) {
    const oldPath = path.resolve(dir, oldName)
    const newPath = path.resolve(dir, newName)
    const rs = fs.createReadStream(oldPath);
    const ws = fs.createWriteStream(newPath);
    rs.pipe(ws)
    rs.on('end', function () {
        fs.unlinkSync(oldPath);
    });
}


module.exports = routerTest