const Schemas = require('../../controller/Schema');

const getBooks = async (ctx, next) => {
    const books = await Schemas.books.find({}).sort({updateTime: 1});
    books.reverse();
    const newBooks = [],
          overBooks = [],
          tryBooks = [];
    for(let i = 0; i < 6; i++) {
        if(books[i]) {
            newBooks.push(books[i]);
            if(books[i].isOver === 2) {
                overBooks.push(books[i])
            }
            if(books[i].isOver === 1) {
                tryBooks.push(books[i])
            }
        }
        
    }
    const result = [{
        title: '最新上传',
        lists: newBooks,
        isOver: 0,
    }, {
        title: '品尝试读',
        lists: tryBooks,
        isOver: 1,
    }, {
        title: '经典完本',
        lists: overBooks,
        isOver: 2,
    }]
    ctx.body = {
        code: 200,
        books: result
    }
    await next();
}
const getChapters = async (ctx, next) => {
    const bookId = ctx.request.body.bookId;
    const book = await Schemas.books.findOne({bookId: bookId});
    const chapters = await Schemas.chapters.find({bookId, bookId});
    let readCount = book.readCount;
    readCount = readCount + 1;
    await Schemas.books.updateOne({bookId: bookId}, {readCount: readCount});
    ctx.body = {
        code: 200,
        chapters: chapters
    }
}
const getContent = async (ctx, next) => {
    const bookId = ctx.request.body.bookId;
    const chapterId = Number(ctx.request.body.chapterId);
    const chapters = await Schemas.chapters.find({bookId: bookId});
    const content = await Schemas.contents.findOne({bookId: bookId, chapterId: chapterId});
    const index = chapters.findIndex(v => v.chapterId === chapterId);
    let isLast = false;
    if(index === (chapters.length - 1)) {
        isLast = true
    }
    let chapter = chapters.find(v => v.chapterId === chapterId);
    const chapterObj = {
        bookId: chapter.bookId,
        chapterId: chapter.chapterId,
        chapterName: chapter.chapterName,
        createTime: chapter.createTime,
    }
    chapter = Object.assign(chapterObj, {isLast: isLast}, {content: content ? content.content : ''});
    ctx.body = {
        code: 200,
        chapter: chapter
    }
}
const moreBooks = async (ctx, next) => {
    const type = ctx.request.body.type || null;
    const isOver = ctx.request.body.isOver || null;
    const like = ctx.request.body.like || null;
    const pageSize = ctx.request.body.pageSize || null;
    const pageNo = ctx.request.body.pageNo || null;
    let searchInfo = {};
    if(like) {
        searchInfo = Object.assign(searchInfo, {like: like});
    }
    if(type) {
        searchInfo = Object.assign(searchInfo, {type: type});
    }
    if(isOver) {
        searchInfo = Object.assign(searchInfo, {isOver: isOver});
    }
    const lists = await Schemas.books.find(searchInfo).sort({updateTime: -1}).limit(pageSize).skip((pageNo - 1) * pageSize);
    const total = await Schemas.books.find(searchInfo).countDocuments();
    const books = [];
    for(let list of lists) {
        const chapters = await Schemas.chapters.find({bookId: list.bookId});
        const chapter = chapters[chapters.length - 1];
        const newChapter = {
            chapterId: chapter && chapter.chapterId,
            chapterName: chapter && chapter.chapterName
        }
        const listObj = {
            bookId: list.bookId,
            author: list.author,
            createTime: list.createTime,
            name: list.name,
            type: list.type,
            keyword: list.keyword,
            typeName: list.typeName,
            imgUrl: list.imgUrl,
            like: list.like,
            isOver: list.isOver,
            readCount: list.readCount,
            description: list.description,
        }
        let obj = Object.assign(listObj, {newChapter: newChapter});
        books.push(obj)
    }
    ctx.body = {
        code: 200,
        data: {
            total: total,
            books: books,
        }
        
    }

}
const searchBooks = async (ctx, next) => {
    const searchVal = ctx.request.body.searchVal;
    const books = await Schemas.books.find({
        name: {$regex: searchVal}
    })
    ctx.body = {
        code: 200,
        books: books
    }
}
exports.getBooks = getBooks;
exports.getChapters = getChapters;
exports.getContent = getContent;
exports.moreBooks = moreBooks;
exports.searchBooks = searchBooks;