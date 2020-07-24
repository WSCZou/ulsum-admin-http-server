const express = require('express')
const router = require('./router')
const fs = require('fs')
const https = require('https')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use('/',router)

const privateKey = fs.readFileSync('./https/ulsum.xyz.key')
const crt = fs.readFileSync('./https/ulsum.xyz.crt')
const credentials = {
    key:privateKey,
    cert:crt
}

const httpsServer = https.createServer(credentials,app)

const server = app.listen(5000,function(){
    const {address,port} = server.address()
    console.log('启动成功',address,port)
})

httpsServer.listen(10086,function(){
    console.log('HTTPS is ok')
})