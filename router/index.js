const express = require('express')
const boom = require('boom')
const userRouter = require('./user')
const articleRouter = require('./article')
const remoteRouter = require('./remote-serch')
const jwtAuth = require('./jwt')
const Result = require('../models/Result');

//注册路由
const router = express.Router()

router.use(jwtAuth)

router.get('/',function(req,res){
    res.send('ulsum')
})

router.use('/user',userRouter)

router.use('/article',articleRouter)

router.use('/search',remoteRouter)

/**
 * 集中处理404请求的中间件
 * 注意：该中间件必须放在正常处理流程之后
 * 否则，会拦截正常请求
 */
router.use((req, res, next) => {
    next(boom.notFound('接口不存在'))
  })

/**
 * 自定义路由异常处理中间件
 * 注意两点：
 * 第一，方法的参数不能减少
 * 第二，方法的必须放在路由最后
 */
router.use((err, req, res, next) => {
    if(err.name && err.name === 'UnauthorizedError'){ //处理 token 错误
        const { status = 401,message } = err
        new Result(null,'Token验证失败',{
            error:status,
            errMsg:message
        }).jwtError(res.status(status))
    }
    else{
        //常规错误
        const msg = (err && err.message) || '系统错误'
        const statusCode = (err.output && err.output.statusCode) || 500;
        const errorMsg = (err.output && err.output.payload && err.output.payload.error) || err.message
        new Result(null,msg,{
            error: statusCode,
            errorMsg,
        }).fail(res.status(statusCode)) 
    }

  })

module.exports = router