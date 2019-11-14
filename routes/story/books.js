const Schemas = require('../../controller/Schema');

const getBooks = async (ctx, next) => {
    const books = await Schemas.books.find({});
    books.reverse();
    const allBooks = [];
    for(let i = 0; i < 100; i++) {
        if(books[i]) {
            let obj = {
                bookId: books[i].bookId,
                name: books[i].name,
                type: books[i].type,
                imgUrl: books[i].imgUrl,
                typeName: books[i].typeName,
                isOver: books[i].isOver,
                author: books[i].author,
                description: books[i].description
            }
            allBooks.push(obj)
        };
    }
    const newBooks = [],
          overBooks = [],
          tryBooks = [];
    for(let i = 0; i < 6; i++) {
        if(books[i]) {
            newBooks.push(allBooks[i]);
            if(allBooks[i].isOver === 2) {
                overBooks.push(allBooks[i])
            }
            if(allBooks[i].isOver === 1) {
                tryBooks.push(allBooks[i])
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
    let readCount = book.readCount;
    readCount = readCount + 1;
    await Schemas.books.updateOne({bookId: bookId}, {readCount: readCount});
    const chapters = book.chapters;
    const newChapters = [];
    for(let chapter of chapters) {
        let obj = {
            chapterId: chapter.chapterId,
            name: chapter.name
        }
        newChapters.push(obj)
    }
    ctx.body = {
        code: 200,
        chapters: newChapters
    }
}
const getContent = async (ctx, next) => {
    const bookId = ctx.request.body.bookId;
    const chapterId = Number(ctx.request.body.chapterId);
    const book = await Schemas.books.findOne({bookId: bookId});
    const chapters = book.chapters;
    const index = chapters.findIndex(v => v.chapterId === chapterId);
    let isLast = false;
    if(index === (chapters.length - 1)) {
        isLast = true
    }
    let chapter = chapters.find(v => v.chapterId === chapterId);
    chapter = Object.assign(chapter, {isLast: isLast});
    ctx.body = {
        code: 200,
        chapter: chapter
    }
}
const searchBooks = async (ctx, next) => {
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
    const lists = await Schemas.books.find(searchInfo).limit(pageSize).skip((pageNo - 1) * pageSize);
    const total = await Schemas.books.find(searchInfo).countDocuments();
    const books = [];
    for(let list of lists) {
        const chapters = list.chapters;
        const chapter = chapters[chapters.length - 1];
        const newChapter = {
            chapterId: chapter && chapter.chapterId,
            name: chapter && chapter.name
        }
        let obj = {
            author: list.author,
            bookId: list.bookId,
            createTime: Math.floor(new Date(list.createTime).getTime() / 1000),
            description: list.description,
            name: list.name,
            isOver: list.isOver,
            like: list.like,
            type: list.type,
            readCount: list.readCount,
            imgUrl: list.imgUrl,
            typeName: list.typeName,
            newChapter: newChapter,
            isLast: list.isLast
        }
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
exports.getBooks = getBooks;
exports.getChapters = getChapters;
exports.getContent = getContent;
exports.searchBooks = searchBooks;