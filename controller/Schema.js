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
    type: Number,
    typeName: String,
    imgUrl: String,
    description: String,
    chapters: [],
    isOver: Number,
    like: Number,
    readCount: Number,
    createTime: Date
})
//查找小说类型
const typesSchema = new mongoose.Schema({})
exports.login = db.model('users', loginSchema)
exports.books = db.model('books', booksSchema)
exports.types = db.model('types', typesSchema)