const Schemas = require('../controller/Schema');
const cheerio = require('cheerio');
const charset = require('superagent-charset');
const request = require('superagent');
charset(request);
// 目录id
async function getChapterId(bookId) {
    let id = 0;
    const chapters = await Schemas.chapters.find({ bookId: bookId });
    if (chapters.length === 0) {
        id = 1;
    } else {
        id = chapters[chapters.length - 1].chapterId + 1;
    }
    return id
}
// 添加章节
const addChapter = async (ctx, next) => {
    try {
        const bookId = ctx.request.body.bookId;
        const chapterName = ctx.request.body.name;
        const chapterId = Number(ctx.request.body.chapterId || 0);
        const newChapterId = await getChapterId(bookId);
        const content = ctx.request.body.content;
        const hasChapter = await Schemas.chapters.find({ bookId: bookId, chapterId: chapterId })
        const hasContent = await Schemas.contents.find({ bookId: bookId, chapterId: chapterId })

        if(hasChapter.length > 0) {
            await Schemas.chapters.updateOne({ bookId: bookId, chapterId: chapterId }, { chapterName: chapterName })
            if(hasContent.length > 0) {
                await Schemas.contents.updateOne({ bookId: bookId, chapterId: chapterId }, { content: content })
            } else {
                const contentObj = {
                    bookId: bookId,
                    chapterId: chapterId,
                    content,
                    createTime: Math.round(new Date().getTime() / 1000)
                }
                await Schemas.contents.create(contentObj)
            }
        } else {
            const chapterObj = {
                bookId: bookId,
                chapterId: newChapterId,
                chapterName,
                createTime: Math.round(new Date().getTime() / 1000)
            }
            await Schemas.chapters.create(chapterObj)
            const contentObj = {
                bookId: bookId,
                chapterId: newChapterId,
                content,
                createTime: Math.round(new Date().getTime() / 1000)
            }
            await Schemas.contents.create(contentObj)
        }
        await Schemas.books.updateOne({bookId: bookId}, {updateTime: Math.round(new Date().getTime() / 1000)})
        ctx.body = {
            code: 200,
            data: {
                msg: '发布文章成功'
            }
        }
    } catch (e) {
        console.log(e)
    }
}
// 删除章节
const deleteChapter = async (ctx, next) => {
    try {
        const bookId = ctx.request.body.bookId;
        const chapterId = Number(ctx.request.body.chapterId);
        await Schemas.chapters.deleteOne({ bookId: bookId, chapterId : chapterId});
        await Schemas.contents.deleteOne({ bookId: bookId, chapterId : chapterId});
        await Schemas.books.updateOne({bookId: bookId}, {updateTime: Math.round(new Date().getTime() / 1000)})
        ctx.body = {
            code: 200,
            data: {
                msg: '删除成功'
            }
        }
    } catch (e) {
        console.log(e)
    }
}
// 获取章节列表
const getChapters = async (ctx, next) => {
    try {
        const bookId = ctx.request.body.bookId,
            pageSize = ctx.request.body.pageSize,
            pageNo = ctx.request.body.pageNo;
        const chapters = await Schemas.chapters.find({bookId: bookId}).limit(pageSize).skip((pageNo - 1) * pageSize).sort({chapterId: -1});
        const total = await Schemas.chapters.find({bookId: bookId}).countDocuments();
        ctx.body = {
            code: 200,
            chapters: chapters,
            total: total
        }
    } catch (e) {
        console.log(e)
    }
}
// 获取章节详情
const getChapterDetail = async (ctx, next) => {
    try {
        const bookId = ctx.request.body.bookId;
        const chapterId = Number(ctx.request.body.chapterId);
        const chapter = await Schemas.chapters.findOne({ bookId: bookId, chapterId: chapterId });
        const content = await Schemas.contents.findOne({ bookId: bookId, chapterId: chapterId });
        ctx.body = {
            code: 200,
            data:{
                content: content,
                chapter: chapter
            } 
        }
    } catch (e) {
        console.log(e)
    }
}
// 上传多章节接口
const addChapters = (ctx, next) => {
    try {
        const bookId = ctx.request.body.bookId;
        const htmlCharset = ctx.request.body.htmlCharset;
        const chapterClassId = ctx.request.body.chapterClassId;
        const contentClassId = ctx.request.body.contentClassId;
        const initCount = Number(ctx.request.body.initCount) || 0;
        const url = ctx.request.body.url;
        const host = ctx.request.body.host;
        const promiseTasks = [];
        getChapter(url)
        function getChapter(url) {
            request.get(url)
            .charset(htmlCharset)
            .end(async function (err, bres) {
                if(err) {
                    return console.log(err)
                }
                if(!bres) {
                    return getChapter(url)
                }
               
                const html = bres.text;
                const $ = cheerio.load(html, {decodeEntities: false});
                const lis = $(chapterClassId);
                for(let i = initCount; i < lis.length + initCount; i++) {
                    const chapterName = $(lis[i]).children().html();
                    const hasChapter = await Schemas.chapters.findOne({bookId: bookId, chapterId: i + 1});
                    if(!hasChapter) {
                        const chapterObj = {
                            bookId: bookId,
                            chapterId: i + 1,
                            chapterName: chapterName,
                            createTime: Math.round(new Date().getTime() / 1000)
                        }
                        await Schemas.chapters.create(chapterObj)
                    }
                    const chapterUrl = $(lis[i]).children().attr('href');
                    promiseTasks.push(getContent(chapterUrl, i))
                }
                for(let i = 0; i < promiseTasks.length; i++) {
                    let task = promiseTasks[i];
                    const hasContent = await Schemas.contents.findOne({bookId: bookId, chapterId: i + 1});
                    if(!hasContent) { 
                        let content = await task();
                        const contentObj = {
                            bookId: bookId,
                            chapterId: i + 1,
                            content,
                            createTime: Math.round(new Date().getTime() / 1000)
                        }
                        await Schemas.contents.create(contentObj)
                    }
                }
                await Schemas.books.updateOne({bookId: bookId}, {updateTime: Math.round(new Date().getTime() / 1000)})
                
            });
        }
        function getContent(url, i) {
            url = url.includes(host) ? url : `${host}${url}`;
            const p = function () {
                return new Promise((resolve, reject) => {
                    try {   
                        request.get(url)
                        .charset(htmlCharset)
                        .end(async (err, sres) => {
                            if(!sres) {
                                addChapters(ctx, next);
                                return 
                            }
                            const html = sres.text;
                            const $ = cheerio.load(html, {decodeEntities: false});
                            $(contentClassId).children().remove('a');
                            $(contentClassId).children().remove('div');
                            $(contentClassId).children().remove('p');
                            let content = $(contentClassId).html();
                            if(content.includes('shuhaige')) {
                                let contentArr = content.split('<br>');
                                contentArr.shift();
                                content = contentArr.join('<br>');
                            }
                            
                            if(!content) {
                                addChapters(ctx, next);
                                return 
                            }
                            resolve(content)
                        });
                    } catch (e) {
                        console.log(e)
                    }
                    
                })
            }
            return p
           
        }
        ctx.body = {
            code: 200,
            data: {
                msg: '发布文章成功'
            }
        }
        
    } catch (e) {
        ctx.body = {
            code: 200,
            data: {
                msg: '发布文章失败'
            }
        }
        console.log(e)
    }
}
exports.addChapter = addChapter;
exports.addChapters = addChapters;
exports.getChapters = getChapters;
exports.getChapterDetail = getChapterDetail;
exports.deleteChapter = deleteChapter;