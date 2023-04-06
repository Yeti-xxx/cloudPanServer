const path = require('path')
const fs = require("fs");
exports.BasePath = 'E:/cloudFiles'

// 文件重命名并移动到指定目录
exports.renameFileAndMove = (dir, oldName, newName) => {
    try {
        const oladPath = path.resolve(dir, oldName)
        const newPath = path.resolve(dir, newName)
        const rs = fs.createReadStream(oladPath)
        const ws = fs.createWriteStream(newPath)
        rs.pipe(ws)
        rs.on('end', () => {
            fs.unlinkSync(oladPath)
        })
        return { over: 'ok' }
    } catch (error) {
        return { err: error }
    }

}
/* 
    fileName:文件名 test.zip yeti.png
    chunkPath:切片文件所在的目录
    fileToken:文件上传初始化时间，由数据库保存
    mergedChunkNum:已合并分片数量
*/
// 文件合并方法
exports.mergeChunkFile = async (fileName, chunkPath, chunkCount, fileToken) => {
    const mergePath = path.join(chunkPath, fileName)
    const ws = fs.createWriteStream(mergePath)
    let mergedChunkNum = 0
    return mergeCore()

    // 递归一下
    function mergeCore() {
        console.log(fileName);
        // 结束标志就是已合并数量大于总数
        if (mergedChunkNum >= chunkCount) {
            return ws.end() //关闭流
        }
        const curChunk = path.resolve(chunkPath, `${fileName}-${mergedChunkNum}-${fileToken}`)
        const curChunkReadStream = fs.createReadStream(curChunk)   //创建读取流
        curChunkReadStream.pipe(ws, { end: false })    //走管道 end = false 则可以连续给writeStream 写数据
        curChunkReadStream.on('end', function(){
            fs.unlinkSync(curChunk)
            mergedChunkNum += 1
            mergeCore()
        })

    }
}