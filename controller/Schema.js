const db = require('./db');
const mongoose = require('mongoose');
//登陆
const loginSchema = new mongoose.Schema({
    username: String,
    password: String
})
//创建小说
const booksSchema = new mongoose.Schema({
    bookId: Number,
    author: String,
    name: String,
    keyword: String,
    type: Number,
    typeName: String,
    imgUrl: String,
    description: String,
    isOver: Number,
    like: Number,
    readCount: Number,
    createTime: Number
})
//创建小说章节
const chapterSchema = new mongoose.Schema({
    bookId: Number,
    chapterId: Number,
    chapterName: String,
    createTime: Number
})
//创建小说内容
const contentSchema = new mongoose.Schema({
    bookId: Number,
    chapterId: Number,
    content: String,
    createTime: Number
})
//查找小说类型
const typesSchema = new mongoose.Schema({})
//想看的小说
const storySchema = new mongoose.Schema({
    name: String,
    createTime: Date,
})
//建议
const optionsSchema = new mongoose.Schema({
    option: String,
    createTime: Date,
})
exports.login = db.model('users', loginSchema)
exports.books = db.model('books', booksSchema)
exports.chapters = db.model('chapters', chapterSchema)
exports.contents = db.model('contents', contentSchema)
exports.types = db.model('types', typesSchema)
exports.stories = db.model('stories', storySchema)
exports.options = db.model('options', optionsSchema)