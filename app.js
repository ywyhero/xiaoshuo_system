const Koa = require('koa')
const app = new Koa()

const cors = require('koa2-cors') //用于跨域
const json = require('koa-json')
const onerror = require('koa-onerror')
const koabody = require('koa-body')
const config = require('./config')
const router = require('./routes')
const jwtKoa  = require('koa-jwt');      // 用于路由权限控制
const port = process.env.PORT || config.port;
const jwtMethod = require('./utils/index.js');
onerror(app)
app.use(cors({
    origin: `${config.address}:${config.prodport}`,
    maxAge: 5, //指定本次预检请求的有效期，单位为秒。
    credentials: true, //是否允许发送Cookie
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], //设置所允许的HTTP请求方法
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'], //设置服务器支持的所有头信息字段
    exposeHeaders: ['authorization'] //设置获取其他自定义字段
}))

app.use(async(ctx, next)=>{
    try {
        const token = ctx.request.header.authorization;
        if (token && ctx.request.url !== '/api/logout') {
            const payload = jwtMethod.getJWTPayload(token.split(' ')[1]);
            const newDate = new Date().getTime();
            if(payload.exp - newDate < 1000 * 60 * 10) {
                const newToken = `Bearer ${jwtMethod.getToken({ username: global.username, password: global.password })}`;
                ctx.append('authorization', newToken)
            } else {
                ctx.append('authorization', token)
            }
        }
    
        return next().catch((err) => {
            if (401 == err.status) {
                ctx.status = 401;
                ctx.body = {
                    status:401,
                    msg:'登录过期，请重新登录'
                }
            } else {
                throw err;
            }
        });
    } catch (err) {
        if(err.message === 'jwt expired') {
            ctx.status = 401;
            ctx.body = {
                status:401,
                msg:'登录过期，请重新登录'
            }
        }
    }
    
});

/* 路由权限控制 */
app.use(jwtKoa({ secret: config.secret }).unless({
    // 设置login、register接口，可以不需要认证访问
    path: [
        /^\/api\/story/,
        /^\/api\/login/,
        /^\/api\/logout/,
        /^\/api\/upload/,
        /^\/upload\//  // 设置除了私有接口外的其它资源，可以不需要认证访问
    ]
}));

// middlewares
app.use(koabody({
    multipart: true,
    formidable: {
        maxFileSize: 200*1024*1024    // 设置上传文件大小最大限制，默认2M
    }
}))
  .use(json())
  .use(require('koa-static')(__dirname + '/public'))
  .use(router.routes())
  .use(router.allowedMethods());


app.on('error', function(err, ctx) {
  console.log('server error', err, ctx)
})

module.exports = app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`)
})
