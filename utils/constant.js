const { env } = require('./env')
const UPLOAD_PATH = env === 'dev' ? 'D:/ulsum_admin/admin-upload-ulsum' : '/root/nginx/upload/admin-upload/'
const UPLOAD_URL  = env === 'dev' ? 'https:/ulsum.xyz': 'http://175.24.115.65/admin-upload'

module.exports = {
    CODE_ERROR: -1,
    CODE_SUCCESS:0,
    CODE_TOKEN_EXPIRED: -2,
    debug:true,
    PWD_SALT: 'admin_imooc_node',
    PRIVATE_KEY: 'ulsum_admin',
    JWT_EXPIRED: 60 * 60, // token失效时间
    UPLOAD_PATH,
    UPLOAD_URL
}