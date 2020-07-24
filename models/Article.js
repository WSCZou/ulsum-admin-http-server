const {UPLOAD_URL,UPLOAD_PATH} = require('../utils/constant')
const fs = require('fs')

class Article{
    constructor(file,data){
        if(file){
            this.createImagPath(file)
        }
        else{
            this.createArticle(data)
        }
    }

    createImagPath(file){
        const re = /image\/(.*)/i
        //图片后缀名
        const suffix = file.mimetype.match(re)[1]
        //图片下载url
        const url = `${UPLOAD_URL}/img/${file.filename}.${suffix}`
        //multer上传的文件名(没有后缀)
        const oldPath = file.path
        //给资源服务器上的加上后缀后的文件名
        const newPath = `${file.path}.${suffix}`
        // 重命名文件
        if (fs.existsSync(oldPath) && !fs.existsSync(newPath)) {
            fs.renameSync(oldPath, newPath) 
        }
        this.url = url//图片线上地址
        this.img_path = newPath
    }

    createArticle(data){
        this.title = data.title
        this.category = data.category
        this.image_uri = data.image_uri
        this.content = data.content
        this.status = data.status
        this.author = data.author
        this.createDt = data.createDt
        this.updateDt = new Date().getTime()
        this.img_path = data.image_path ||data.img_path
        this.articleId = data.articleId
        this.sortId = data.sortId
    }

    toDb(){
        return{
            title : this.title,
            category : this.category,
            image_uri : this.image_uri,
            content : this.content,
            status : this.status,
            author : this.author,
            createDt : this.createDt,
            updateDt : this.updateDt,
            articleId: this.articleId,
            img_path:this.img_path,
            sortId:this.sortId
        }
    }

    //删除文件
    reset(){
        if(Article.pathExists(this.img_path)){ 
            fs.unlinkSync(this.img_path)
        }
    }

    static pathExists(path){
        return fs.existsSync(path)
    }

    
}


module.exports = Article