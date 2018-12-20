const Promise = require('bluebird');
const RoutesInfo = require('@quoin/expressjs-routes-info');
const warpjsUtils = require('@warp-works/warpjs-utils');

const constants = require('./../../lib/constants');
const Question = require('./../../lib/models/question');
const utils = require('./../utils');

module.exports = (req, res) => warpjsUtils.wrapWith406(res, {
    [warpjsUtils.constants.HAL_CONTENT_TYPE]: async () => {
        const { resultId, questionId, thumbDirection } = req.params;
        const pluginInfo = utils.getPluginInfo(req);
        const resource = warpjsUtils.createResource(req, {
            domain: pluginInfo.domain,
            questionId,
            thumbDirection,
            resultId
        });

        try {
            const domainModel = await pluginInfo.warpCore.getDomainByName(pluginInfo.domain);
            const questionEntity = await domainModel.getEntityByName(pluginInfo.config.schema.question);
            const questionInstance = await questionEntity.getInstance(pluginInfo.persistence, questionId);

            const questionModel = new Question();
            await questionModel.fromPersistence(Promise, pluginInfo, questionEntity, questionInstance);
            const questionHAL = await questionModel.toHalResultFeedbackSpecific(warpjsUtils, RoutesInfo, constants.routes, resultId, thumbDirection);
            await resource.embed('feedbackQuestions', questionHAL);
            await utils.sendHal(req, res, resource);
        } catch (err) {
            console.error("server/root/get-questions: err:", err);
            await utils.sendErrorHal(req, res, resource, err);
        } finally {
            await pluginInfo.persistence.close();
        }
    }
});
