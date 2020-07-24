const express = require('express')
const router = express.Router()
const Result = require('../models/Result');
const CategoryList = ['音乐','NBA','足球','球鞋','衣服','球衣']

router.get('/category',function(req,res,next){
    const { name } = req.query
    const FilterList = CategoryList.filter(item => {
      const lowerCaseName = item.toLowerCase()
        return !(name && lowerCaseName.indexOf(name.toLowerCase())<0)
      })
    new Result({ FilterList },'搜索成功').success(res);
})

module.exports=router