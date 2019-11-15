const Schemas = require('../controller/Schema');
const jwtMethod = require('../utils/index.js');
const login = async (ctx, next) => {
    try{
        global.username = ctx.request.body.username;
        global.password = ctx.request.body.password;
        const data = await Schemas.login.find({
            username: global.username,
            password: global.password
        })
       
        if(data.length === 0) {
            return ctx.body = {
                code: 400,
                data: {
                    msg: '登陆账号或者密码错误'
                }
            }
        }
        ctx.body = {
            code: 200,
            data: {
                token: jwtMethod.getToken({ username:global.username, password: global.password }),
                msg: '登陆成功'
            }
        }
        await next();
    }catch(err) {
        ctx.body = {
            code: 500,
            data: err
        }
    }
}
const logout = async (ctx, next) => {
    try{
        global.username = '';
        global.password = '';
        ctx.body = {
            code: 200,
            data: {
                msg: '退出成功'
            }
        }
        await next();
    }catch(err) {
        ctx.body = {
            code: 500,
            data: err
        }
    }
}

exports.login = login;
exports.logout = logout;
