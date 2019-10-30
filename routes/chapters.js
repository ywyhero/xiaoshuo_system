const Schemas = require('../controller/Schema');
// 目录id
async function getChapterId(bookId) {
    let id = 0;
    const book = await Schemas.books.findOne({ bookId: bookId });
    const chapters = book.chapters;
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
        const name = ctx.request.body.name;
        const chapterId = Number(ctx.request.body.chapterId);
        const newChapterId = await getChapterId(bookId);
        const content = ctx.request.body.content;
        const book = await Schemas.books.findOne({ bookId: bookId });
        const chapters = book.chapters;
        const chapter = chapters.find(v => v.chapterId === chapterId);
        if(chapter) {
            const index = chapters.findIndex(v => v.chapterId === chapterId);
            const newChapter = {
                chapterId: chapter.chapterId,
                name,
                content,
                createTime:  chapter.createTime
            }
            chapters.splice(index, 1, newChapter);
        } else {
            chapters.push({
                chapterId: newChapterId,
                name,
                content,
                createTime: new Date().getTime()
            })
           
        }
        await Schemas.books.updateOne({ bookId: bookId }, { chapters: chapters })
    
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
        const book = await Schemas.books.findOne({ bookId: bookId });
        const chapters = book.chapters;
        const index = chapters.findIndex(v => v.chapterId === chapterId);
        chapters.splice(index, 1);
        await Schemas.books.updateOne({ bookId: bookId }, { chapters: chapters })
    
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
            chapterId = ctx.request.body.chapterId,
            chapterName = ctx.request.body.chapterName,
            pageSize = ctx.request.body.pageSize,
            pageNo = ctx.request.body.pageNo;
        const data = await Schemas.books.findOne({ bookId: bookId });
        const lists = data.chapters.reverse();
        let total = 0;
        const chapters = [],
            len = lists.length > pageSize * pageNo ? pageSize * pageNo : lists.length;
        if(chapterId && chapterName !== '') {
            const chapter = lists.find((v) => v.chapterId === chapterId && v.name.includes(chapterName));
            if(chapter) {
                chapters.push(chapter)
                total = chapters.length;
            }
        } else if(chapterId) {
            const chapter = lists.find((v) => v.chapterId === chapterId );
            chapters.push(chapter)
            total = chapters.length;
        } else if(chapterName !== '') {
            const chapter = lists.filter((v) => v.name.includes(chapterName));
            for(let c of chapter) {
                chapters.push(c)
            }
            total = chapters.length;
        } else {
            for(let i = (pageNo - 1) * pageSize; i < len; i++) {
                chapters.push(lists[i])
            }
            total = lists.length;
        }
        
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
        const book = await Schemas.books.findOne({ bookId: bookId });
        const chapters = book.chapters;
        const chapter = chapters.find(v => v.chapterId === chapterId);
        ctx.body = {
            code: 200,
            chapter: chapter
        }
    } catch (e) {
        console.log(e)
    }
}
exports.addChapter = addChapter;
exports.getChapters = getChapters;
exports.getChapterDetail = getChapterDetail;
exports.deleteChapter = deleteChapter;