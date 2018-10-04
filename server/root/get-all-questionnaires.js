// const debug = require('debug')('W2:plugin:survey-tool:root/get-all-questionnaires');
const Promise = require('bluebird');
const RoutesInfo = require('@quoin/expressjs-routes-info');
const warpjsUtils = require('@warp-works/warpjs-utils');

const constants = require('./../../lib/constants');
const Questionnaire = require('./../../lib/models/questionnaire');
const utils = require('./../utils');

module.exports = (req, res) => warpjsUtils.wrapWith406(res, {
    html: () => {
        warpjsUtils.sendIndex(req, res, RoutesInfo, 'Ipt',
            [
                `${req.app.get('base-url')}/assets/${constants.assets.surveys}`
            ],
            `${req.app.get('base-url')}/assets/${constants.assets.css}`
        );
    },
    [warpjsUtils.constants.HAL_CONTENT_TYPE]: async () => {
        const pluginInfo = utils.getPluginInfo(req);

        const resource = warpjsUtils.createResource(req, {
            title: `Domain ${pluginInfo.domain} - Survey Tool`,
            domain: pluginInfo.domain
        });

        try {
            const domainModel = await pluginInfo.warpCore.getDomainByName(pluginInfo.domain);
            const questionnaireEntity = await domainModel.getEntityByName(pluginInfo.config.schema.questionnaire);
            const questionnaireDocuments = await questionnaireEntity.getDocuments(pluginInfo.persistence);
            const questionnaireInstances = await Promise.map(
                questionnaireDocuments,
                async (questionnaireDocument) => {
                    const questionnaire = new Questionnaire();
                    await questionnaire.fromPersistence(Promise, pluginInfo, questionnaireEntity, questionnaireDocument);
                    return questionnaire;
                }
            );

            const questionnairesHAL = questionnaireInstances.map((questionnaireInstance) => questionnaireInstance.toBaseHal(warpjsUtils, RoutesInfo, constants.routes));
            resource.embed('questionnaires', questionnairesHAL);
            await utils.sendHal(req, res, resource);
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error("server/root/get-all-questionnaires: err:", err);
            await utils.sendErrorHal(req, res, resource, err);
        } finally {
            await pluginInfo.persistence.close();
        }
    }
});
