const jwt = require('jsonwebtoken'); // 用于签发、解析`token`
const config = require('./../config/index.js');
// 获取一个期限为2小时的token 
function getToken(payload = {}) {
    return jwt.sign(payload, config.secret, { expiresIn: '2h' });
}

// 通过token获取JWT的payload部分 
function getJWTPayload(token) {
    // 验证并解析JWT
    return jwt.verify(token, config.secret);
}

exports.getJWTPayload = getJWTPayload;
exports.getToken = getToken;