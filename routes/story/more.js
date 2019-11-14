const Schemas = require('../../controller/Schema');
// 获取书本类型
const getTypes = async (ctx, next) => {
    try {
        const like = ctx.request.body.like;
        const types = await Schemas.types.find({like: like});
        ctx.body = {
            code: 200,
            types: types
        }
    } catch (e) {
        console.log(e)
    }
}

exports.getTypes = getTypes;