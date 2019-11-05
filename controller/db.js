const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:26016/xiaoshuo',{
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
