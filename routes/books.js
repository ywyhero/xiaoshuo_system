const Schemas = require('../controller/Schema');
const fs = require('fs');
const path = require('path');
const config = require('./../config/index.js');
let fileName = '';
// 书本id
async function getId () {
    let bookId = 0;
    const books = await Schemas.books.find({});
    if(books.length === 0) {
        bookId = 100000;
    } else {
        bookId = books[books.length - 1].bookId + 1;
    }
    return bookId
}
const readFileEvent = (filePath) => {
    return new Promise((resolve, reject) => {
        try{
            if(!filePath) {
                readFileEvent(filePath)
                return;
            }
            fs.readFile(path.resolve(__dirname, '../') + '/' + filePath, async (err, data) => {
                if(err) {
                    reject(err)
                    return
                }
                resolve(data.toString())
            })  
        } catch(err) {
            reject(err)
        }
    })
}
const uploadTxt = async (ctx, next) => {
    try{
        const file = ctx.request.files.file;
        // 创建可读流
        const render = await fs.createReadStream(file.path);
        const fileName = `${file.name.split('.')[0]}${Math.floor(new Date().getTime() / 1000)}.${file.name.split('.')[1]}`
        let filePath = path.join('public', 'upload/', fileName);
        const upStream = await fs.createWriteStream(filePath);
        await render.pipe(upStream);
        const result = await readFileEvent(upStream.path);
        ctx.body = {
            code: 200,
            data: {
                msg: result
            }
        } 
        await next();
    } catch(err) {
        console.log(err)
    }
}
// 上传图片
const upload = async (ctx, next) => {
    try {
        const file = ctx.request.files.file;
        // 创建可读流
        const render = fs.createReadStream(file.path);

        if (!(/jpg|png|jpeg/.test(file.name.split('.')[1]))) {
            ctx.body = {
                code: 500,
                data: {
                    msg: '上传的图片不是jpg,jpeg,png的格式'
                }
            }
            return
        }
        fileName = `${file.name.split('.')[0]}${Math.floor(new Date().getTime() / 1000)}.${file.name.split('.')[1]}`
        let filePath = path.join('public', 'upload/', fileName);
        // 创建写入流
        const upStream = fs.createWriteStream(filePath);
        render.pipe(upStream);
        ctx.body = {
            code: 200,
            data: {
                imgUrl: `${config.address}:3000/upload/${fileName}`
            }
        }
        await next();
    } catch (e) {
        console.log(e)
    }
}
// 创建书本
const createBook = async (ctx, next) => {
    try {
        const bookId = ctx.request.body.bookId;
        const name = ctx.request.body.name;
        const type = ctx.request.body.type;
        const typeName = ctx.request.body.typeName;
        const author = ctx.request.body.author;
        if(bookId) {
            const booksInfo = {
                author,
                name,
                type,
                typeName,
                imgUrl: fileName ? `${config.address}:3000/upload/${fileName}` : `${config.address}:3000/upload/default.jpg`
            }
            await Schemas.books.updateOne({bookId: bookId}, booksInfo);
            ctx.body = {
                code: 200,
                data: {
                    msg: '修改成功'
                }
            }
        } else {
            const chapters = [];
            const newBookId = await getId();
            const booksInfo = {
                bookId: newBookId,
                author,
                createTime: new Date(),
                name,
                type,
                typeName,
                chapters,
                imgUrl: fileName ? `${config.address}:3000/upload/${fileName}` : `${config.address}:3000/upload/default.jpg`
            }
            await Schemas.books.create(booksInfo)
            ctx.body = {
                code: 200,
                data: {
                    msg: '保存成功'
                }
            }
        }
        
    } catch (e) {
        console.log(e)
    }
}
// 获取书本类型
const getTypes = async (ctx, next) => {
    try {
        const types = await Schemas.types.find({});
        ctx.body = {
            code: 200,
            types: types
        }
    } catch (e) {
        console.log(e)
    }
}
// 查询所有书本
const searchBooks = async (ctx, next) => {
    try {
        const pageNo = ctx.request.body.pageNo;
        const pageSize = ctx.request.body.pageSize;
        const bookId = ctx.request.body.bookId || null;
        const type = ctx.request.body.type || null;
        let findObj = {};
        if(bookId) {
            findObj = Object.assign(findObj, {bookId: bookId})
        }
        if(type) {
            findObj = Object.assign(findObj, {type: type})
        }
        const books = await Schemas.books.find(findObj).limit(pageSize).skip((pageNo - 1) * pageSize);
        const total = await Schemas.books.find(findObj).countDocuments();
        const lists = [];
        for(let book of books) {
            let obj = {
                bookId: book.bookId,
                name: book.name,
                author: book.author,
                type: book.type,
                typeName: book.typeName,
                imgUrl: book.imgUrl,
                createTime: new Date(book.createTime).getTime()
            }
            lists.push(obj);
        }
        ctx.body = {
            code: 200,
            total: total,
            lists: lists
        }
    } catch (e) {
        console.log(e)
    }
}
// 删除书本
const deleteBook = async (ctx, next) => {
    try {
        const bookId = ctx.request.body.bookId;
        await Schemas.books.deleteOne({ bookId: bookId });
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
exports.upload = upload;
exports.uploadTxt = uploadTxt;
exports.createBook = createBook;
exports.getTypes = getTypes;
exports.searchBooks = searchBooks;
exports.deleteBook = deleteBook;