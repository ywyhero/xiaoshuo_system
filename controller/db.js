const mongoose = require('mongoose');
mongoose.connect('mongodb://vine:900808@127.0.0.1:27017/xiaoshuo',{
    useNewUrlParser: true,
    useUnifiedTopology: true 
});
const db = mongoose.connection;
db.once('open', () => {
    console.log('数据库连接成功')
})
db.once('error', () => {
    console.log('数据库连接失败')
})

module.exports = db
