const express = require('express')
const routerTest = express.Router()

routerTest.get('/hi',(req,res)=>{
    console.log(req);
    res.send('test success!!')
})

module.exports = routerTest