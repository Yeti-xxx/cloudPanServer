const mysql = require('mysql')
const db = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'h123321123',
    database: 'clouddata',
})

module.exports = db