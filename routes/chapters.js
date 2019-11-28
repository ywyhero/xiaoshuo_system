const Schemas = require('../controller/Schema');
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
        const chapterId = Number(ctx.request.body.chapterId);
        const newChapterId = await getChapterId(bookId);
        const content = ctx.request.body.content;
        if(chapterId) {
            await Schemas.chapters.updateOne({ chapterId: chapterId }, { chapterName: chapterName })
            await Schemas.contents.updateOne({ chapterId: chapterId }, { content: content })
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
        const chapters = await Schemas.chapters.find({bookId: bookId}).limit(pageSize).skip((pageNo - 1) * pageSize).reverse();
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
exports.addChapter = addChapter;
exports.getChapters = getChapters;
exports.getChapterDetail = getChapterDetail;
exports.deleteChapter = deleteChapter;