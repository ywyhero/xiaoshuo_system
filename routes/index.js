const Router = require('koa-router');
const router = new Router();
const Common = require('./common.js');
const Books = require('./books.js');
const Chapters = require('./chapters.js');
const Logs = require('./logs.js');
const storyBooks = require('./story/books');
const storyMore = require('./story/more');
const storyCommon = require('./story/common');

router.prefix('/api');
/**
 * 小说前端接口
 */
//获取书本接口
router.post('/story/getBooks', storyBooks.getBooks);
//获取章节接口
router.post('/story/getChapters', storyBooks.getChapters);
//获取内容接口
router.post('/story/getContent', storyBooks.getContent);
// 更多书本
router.post(`/story/moreBooks`, storyBooks.moreBooks);
// 搜索书本
router.post(`/story/searchBooks`, storyBooks.searchBooks);
// 获取所有书本类型
router.post(`/story/getTypes`, storyMore.getTypes);
// 想看的小说
router.post(`/story/setStory`, storyCommon.setStory);
// 建议
router.post(`/story/setOptions`, storyCommon.setOptions);

/**
 * 小说后台管理系统的接口
 */
// 登陆接口
router.post(`/login`, Common.login);
// 退出接口
router.post(`/logout`, Common.logout);
// 上传书本图片
router.post(`/upload`, Books.upload);
router.post(`/uploadTxt`, Books.uploadTxt);
// 创建书本
router.post(`/books`, Books.createBook);
// 获取所有书本类型
router.post(`/types`, Books.getTypes);
// 查询所有书本
router.post(`/booklists`, Books.searchBooks);
// 删除书本
router.post(`/deletebook`, Books.deleteBook);
// 添加章节
router.post(`/addChapter`, Chapters.addChapter);
// 删除章节
router.post(`/deleteChapter`, Chapters.deleteChapter);
// 获取章节列表
router.post(`/getChapters`, Chapters.getChapters);
// 获取章节详情
router.post(`/getChapterDetail`, Chapters.getChapterDetail);
// 想看的小说日志
router.post(`/storyLogs`, Logs.storyLogs);
// 建议日志
router.post(`/optionsLogs`, Logs.optionsLogs);

module.exports =  router
