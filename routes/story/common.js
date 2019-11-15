const Schemas = require('../../controller/Schema');
const setStory = async (ctx, next) => {
    const name = ctx.request.body.name;
    await Schemas.stories.create({
        name: name,
        createTime: new Date()
    })
    ctx.body = {
        code: 200,
        data: {
            msg: '留言成功'
        }
    }
}
const setOptions = async (ctx, next) => {
    const option = ctx.request.body.option;
    await Schemas.options.create({
        option: option,
        createTime: new Date()
    })
    ctx.body = {
        code: 200,
        data: {
            msg: '留言成功'
        }
    }
}
exports.setStory = setStory;
exports.setOptions = setOptions;