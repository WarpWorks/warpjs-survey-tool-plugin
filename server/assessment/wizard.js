// const debug = require('debug')('W2:plugin:survey-tool:assessment/wizard');
const RoutesInfo = require('@quoin/expressjs-routes-info');
const warpjsUtils = require('@warp-works/warpjs-utils');

const constants = require('./../../lib/constants');
const Questionnaire = require('./../../lib/models/questionnaire');

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

        const pluginConfig = req.app.get(constants.appKeys.pluginConfig);
        const domain = pluginConfig.domainName;

        const Persistence = require(pluginConfig.persistence.module);
        const persistence = new Persistence(pluginConfig.persistence.host, domain);

        const warpCore = req.app.get(constants.appKeys.warpCore);

        const resource = warpjsUtils.createResource(req, {
            domain,
            surveyId,
            assessmentId
        });

        try {
            const domainModel = await warpCore.getDomainByName(domain);
            const questionnaireEntity = domainModel.getEntityByName(pluginConfig.schema.questionnaire);
            const instance = await questionnaireEntity.getInstance(persistence, surveyId);
            if (!instance.id) {
                throw new Error(`Cannot find Survey Tool id: ${surveyId}`);
            }
            const questionnaire = new Questionnaire(questionnaireEntity, instance);
            const hal = await questionnaire.toHalFull(domain, pluginConfig, persistence);
            resource.embed('questionnaires', hal);

            warpjsUtils.sendHal(req, res, resource, RoutesInfo);
        } catch (err) {
            console.error("server/assessment/wizard: err:", err);
            warpjsUtils.sendErrorHal(req, res, resource, err, RoutesInfo);
        } finally {
            await persistence.close();
        }
    }
});
