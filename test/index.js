const express = require('express')
const db = require('../db/mysql')
const routerTest = express.Router()
const bcryptjs = require('bcryptjs')

// const testpass = bcryptjs.hashSync('123654',10)
// const testpass = '$2a$10$tA6dCUcLwGZU7XxiQJi.v.XDBAAYmH9csVwlDiZlNAiCCsEUs/Nq6'
// console.log(testpass);
// console.log(bcryptjs.compareSync('123654',testpass));

routerTest.get('/hi',(req,res)=>{
    const sql = 'select * from testDB'
    db.query(sql,(err,resdb)=>{
        if (err) {
            return console.log(err);
        }
        res.send(resdb[0].test)
    })
    
})

module.exports = routerTest