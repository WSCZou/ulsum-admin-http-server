const express = require('express')
const multer = require('multer')
const {UPLOAD_PATH} = require('../utils/constant')
const Result = require('../models/Result')
const fs = require('fs')
const {decoded} = require('../utils/index')
const {insertArticle,removeImg,getArticle,updateArticle,getCategory,listArticle,deleteArticle,getSortId,getAllList} = require('../services/article')
const boom = require('boom')
const Article = require('../models/Article')
const { rejects } = require('assert')
const article = require('../services/article')

const router = express.Router()

router.post('/upload',
multer({dest:`${UPLOAD_PATH}/img`}).single('file'),
function(req,res,next){
    if(!req.file || req.file.length === 0){
        new Result('上传图片失败').fail(res)
    }
    else{
        const article = new Article(req.file)
        const url = article.url
        const imgPath =article.img_path
        new Result({url,imgPath},'上传图片成功').success(res)
    }
})

router.post('/create',function(req,res,next){
    const decode = decoded(req)
    const data = req.body 
    if(decode && decode.username){
        let article = new Article(null,data)
        insertArticle(article).then(()=>{
            new Result('发布文章成功').success(res)
        }).catch(err=>{
            next(boom.badImplementation(err))
        })
    }

})


router.post('/remove',function(req,res,next){
    const decode = decoded(req)
    const data = req.body 
    if(decode && decode.username){
        removeImg(data.image_path).then(()=>{
            new Result('图片删除成功').success(res)
        }).catch(e=>{
            next(boom.badImplementation(e))
        })
    }

})

router.get('/get',function(req,res,next){
    const {articleId} = req.query
    console.log(articleId)
    if(!articleId){
        next(boom.badRequest(new Error('articleId不能为空')))
    }else{
        getArticle(articleId).then(Article => {
            new Result(Article,'获取文章信息成功').success(res)
        }).catch(err => {
            next(boom.badImplementation(err))
        })
    }
})

router.get('/getId',function(req,res,next){
        getSortId().then(article => {
            new Result(article,'获取id成功').success(res)
        }).catch(err => {
            next(boom.badImplementation(err))
        })
})

router.post('/update',function(req,res,next){
    const decode = decoded(req)
    const data = req.body 
    if(decode && decode.username){
        let article = new Article(null,data)
        article = article.toDb()
        updateArticle(article).then(()=>{
            new Result('更新文章成功').success(res)
        }).catch(err=>{
            next(boom.badImplementation(err))
        })
    }

})

router.get('/category',function(req,res,next){
    getCategory().then(category => {
        new Result(category,'获取分类成功').success(res)
    }).catch(err=>{
        next(boom.badImplementation(err))
    })
})

router.get('/list',function(req,res,next){
    listArticle(req.query).then(({list,count,page,pageSize}) => {
        console.log(count)
        new Result({list,count,page:+page,pageSize:+pageSize},'获取文章列表成功').success(res)
    }).catch(err=>{
        next(boom.badImplementation(err))
    })
})

router.get('/getAllList',function(req,res,next){
    getAllList().then(({list,count}) => {
        new Result({list,count},'获取总列表成功').success(res)
    }).catch(err=>{
        next(boom.badImplementation(err))
    })
})

router.get('/delete',function(req,res,next){
    const {articleId} = req.query
    console.log(articleId)
    if(!articleId){
        next(boom.badRequest(new Error('articleId不能为空')))
    }else{
        deleteArticle(articleId).then(() => {
            new Result('删除文章信息成功').success(res)
        }).catch(err => {
            next(boom.badImplementation(err))
        })
    }
})


router.post('/saveSort',function(req,res,next){
    const decode = decoded(req)
    const data = req.body 
    if(decode && decode.username){
        const allPromise = data.map(item=>{
            let article = new Article(null,item)
            article = article.toDb()
            return updateArticle(article)
        })
        //console.log('allPromise:',allPromise)
        Promise.all(allPromise).then(()=>{
            new Result('排序成功').success(res)
        }).catch(err=>{
            next(boom.badImplementation(err))
        })
    }

})

module.exports=router