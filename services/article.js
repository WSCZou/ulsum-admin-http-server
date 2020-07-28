const { insert, queryOne, update, querySql,and,andLike} = require("../db/index");
const fs = require("fs");
const { resolve } = require("path");
const { rejects } = require("assert");
const db = require("../db/index");
const Article = require("../models/Article");

function exists(article) {
  const { title, author } = article;
  const sql = `select * from article where title='${title}' and author='${author}'`;
  return queryOne(sql);
}

//当作者和标题一样的时候从服务器把刚刚添加的封面图片删除
function removeArticleImg(article) {
  if (article) {
    article.reset();
  }
}

function insertArticle(article) {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await exists(article);
      if (result) {
        await removeArticleImg(article); //删除刚刚上传的图片
        reject(new Error("文章标题和作者已存在"));
      } else {
        console.log('插入前',article)
        await insert(article.toDb(), "article"); //传对象和表名
        resolve();
      }
    } catch (e) {
      reject(e);
    }
  });
}

//当点击删除图片按钮时删除图片
function removeImg(img_path) {
  return new Promise(async (resolve, reject) => {
    try {
      await fs.unlinkSync(img_path);
      resolve();
    } catch (e) {
      reject(e);
    }
  });
}

function getArticle(articleId) {
  return new Promise(async (resolve, reject) => {
    const articleSql = `select * from article where articleId = '${articleId}'`;
    const article = await queryOne(articleSql);
    if (article) {
      resolve(article);
    } else {
      reject(new Error("文章不存在"));
    }
  });
}

async function getSortId(){
    const sql = "select * from article order by sortId desc limit 1";
    const result = await db.queryOne(sql);
    return result;
}

function updateArticle(article) {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await getArticle(article.articleId);
      if (result) {
        await update(
          article,
          "article",
          `where articleId='${article.articleId}'`
        );
        resolve();
      }
    } catch (e) {
      reject(e);
    }
  });
}

async function getCategory() {
  const sql = "select * from acategory order by category asc";//从acategory视图当中获取
  const result = await db.querySql(sql);
  const categoryList = [];
  result.forEach((item) => {
    categoryList.push({
      label: item.category,
      value: item.category,
      num: item.num,
    });
  });
  return categoryList;
}

async function listArticle(query) {
    //console.log(query)
    const { category, author, title, page=1, pageSize=20 } = query;
    const offset = (page-1) * pageSize
    let articleSql = "select * from article ";
    let where = "where";
    author && (where = andLike(where,'author',author))
    title && (where = andLike(where,'title',title))
    category && (where = and(where,'category',category))
    if (where !== "where") {
      articleSql = `${articleSql} ${where} order by sortId`;
    }
    else{
      articleSql = `${articleSql} order by sortId`;
    }
    let countSql = `select count(*) as count from article`//查询数据库条数
    if(where !== 'where'){
        countSql = `${countSql} ${where}`
    }
    const count = await querySql(countSql)
    articleSql = `${articleSql} limit ${pageSize} offset ${offset}`
    const list = await querySql(articleSql);
    return { list,count:count[0].count,page,pageSize }; 
  }

function deleteArticle(articleId){
    return new Promise(async (resolve,reject)=>{
        let article = await getArticle(articleId)
        
        if(article){
            const articleObj = new Article(null,article)
            //console.log('新建文章对象：',articleObj)
            const sql = `delete from article where articleId='${articleId}'`
            const updateSql=`UPDATE article SET sortId=sortId-1 where sortId>${articleObj.sortId}`
            querySql(sql).then(() => {
                articleObj.reset()//在服务器删除图片文件
            }).then(()=>{
                querySql(updateSql).then(()=>{
                    resolve()
                })
                
            })
        }else{
            reject(new Error('文章不存在'))
        }

    })
}

async function getAllList(){
    const sql = "select * from article order by sortId ";
    const countSql = `select count(*) as count from article`//查询数据库条数
    const list = await db.querySql(sql);
    const count = await querySql(countSql)
    return {list,count:count[0].count};
}

module.exports = {
  insertArticle,
  removeImg,
  getArticle,
  updateArticle,
  getCategory,
  listArticle,
  deleteArticle,
  getSortId,
  getAllList
};
