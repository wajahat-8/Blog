require('dotenv').config()

let PORT = process.env.PORT
let MONGODB_URI = process.env.MONGODB_URI==='test'?process.env.Test_MONGODB_URI:process.env.MONGODB_URI

module.exports = { MONGODB_URI, PORT }