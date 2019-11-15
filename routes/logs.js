const Schemas = require('../controller/Schema');
const storyLogs = async (ctx, next) => {
    const logs = await Schemas.stories.find({});
    ctx.body = {
        code: 200,
        logs: logs
    }
}
const optionsLogs = async (ctx, next) => {
    const logs = await Schemas.options.find({});
    ctx.body = {
        code: 200,
        logs: logs
    }
}
exports.storyLogs = storyLogs;
exports.optionsLogs = optionsLogs;