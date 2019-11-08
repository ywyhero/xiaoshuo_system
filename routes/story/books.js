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
        lists: newBooks
    }, {
        title: '品尝试读',
        lists: tryBooks
    }, {
        title: '经典完本',
        lists: overBooks
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
    const chapter = chapters.find(v => v.chapterId === chapterId);
    ctx.body = {
        code: 200,
        chapter: chapter
    }
}
exports.getBooks = getBooks;
exports.getChapters = getChapters;
exports.getContent = getContent;