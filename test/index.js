const express = require('express')
const db = require('../db/mysql')
const routerTest = express.Router()
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')

// const token = jwt.sign({ foo: 'bar' }, 'I_LOVE_JING',{expiresIn:1})
// console.log(token);
// try {
//     console.log(jwt.verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmb28iOiJiYXIiLCJpYXQiOjE2Nzg2OTAzMDgsImV4cCI6MTY3ODY5MDMwOX0.8FLq--BbKK-6sH77DT2FRKgWVZtyTE8CyheQ7_rjQtM','I_LOVE_JING'));
// } catch (error) {
//     console.log(error.name);
// }

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