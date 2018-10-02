// const debug = require('debug')('W2:plugin:survey-tool:assessment/wizard');
const RoutesInfo = require('@quoin/expressjs-routes-info');
const warpjsUtils = require('@warp-works/warpjs-utils');

const constants = require('./../../lib/constants');
const Questionnaire = require('./../../lib/models/questionnaire');
const utils = require('./../utils');

module.exports = (req, res) => warpjsUtils.wrapWith406(res, {
    html: () => {
        warpjsUtils.sendIndex(req, res, RoutesInfo, 'Ipt',
            [
                `${req.app.get('base-url')}/assets/${constants.assets.assessment}`
            ],
            `${req.app.get('base-url')}/assets/${constants.assets.css}`
        );
    },

    [warpjsUtils.constants.HAL_CONTENT_TYPE]: async () => {
        const { surveyId, assessmentId } = req.params;
        const pluginInfo = utils.getPluginInfo(req);

        const resource = warpjsUtils.createResource(req, {
            domain: pluginInfo.domain,
            surveyId,
            assessmentId
        });

        try {
            const domainModel = await pluginInfo.warpCore.getDomainByName(pluginInfo.domain);
            const questionnaireEntity = domainModel.getEntityByName(pluginInfo.config.schema.questionnaire);
            const instance = await questionnaireEntity.getInstance(pluginInfo.persistence, surveyId);
            if (!instance.id) {
                throw new Error(`Cannot find Survey Tool id: ${surveyId}`);
            }
            const questionnaire = new Questionnaire(questionnaireEntity, instance);
            const hal = await questionnaire.toHalFull(pluginInfo.domain, pluginInfo.config, pluginInfo.persistence);
            resource.embed('questionnaires', hal);

            await utils.sendHal(req, res, resource);
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error("server/assessment/wizard: err:", err);
            await utils.sendErrorHal(req, res, resource, err);
        } finally {
            await pluginInfo.persistence.close();
        }
    }
});
