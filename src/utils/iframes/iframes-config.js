/**
 * 是否启用全局iframes缓存组件
 */
 export const IFRAMES_ENABLE = true

 /**
  * 配置模块信息
  * 注：
  * 模块ID请勿重复
  * 对应配置项也可以通过后台传过来的值自行处理成对应格式
  */
 
 // 直接配置的话可以通过环境变量设置域名。对应开发环境，测试环境，线上环境
 const BD_DOMAIN = process.env.VUE_APP_BD_URL // 配置在 .env.* 文件
 const PAGES = {
   // 标识 id
   'admin_interface': {
     // 具体生成的 ifrmae 的 name
     name: '接口文档',
     src: 'https://xznode.club/swagger/index.html'
   },
   'httpReports': {
    name: '接口报表',
    src: 'http://xznode.club:12797/'
  }
 }
 
 const IFRAMES_PAGE = { ...PAGES }
 export function PAGE_LIST() {
   return IFRAMES_PAGE
 }
 