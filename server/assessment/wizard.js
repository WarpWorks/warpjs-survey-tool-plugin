// const debug = require('debug')('W2:plugin:survey-tool:assessment/wizard');
const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const RoutesInfo = require('@quoin/expressjs-routes-info');
const { v4: uuid } = require('uuid');
const warpjsUtils = require('@warp-works/warpjs-utils');

const config = require('../config');
const constants = require('./../../lib/constants');
const Questionnaire = require('./../../lib/models/questionnaire');
const utils = require('./../utils');

module.exports = (req, res) => warpjsUtils.wrapWith406(res, {
    html: async () => {
        await warpjsUtils.sendIndex(req, res, RoutesInfo, 'Ipt',
            [
                `${req.app.get('base-url')}/assets/${constants.assets.assessment}`
            ],
            `${req.app.get('base-url')}/assets/${constants.assets.css}`
        );
    },

    [warpjsUtils.constants.HAL_CONTENT_TYPE]: async () => {
        const { surveyId } = req.params;
        const { assessmentId } = req.query;
        const pluginInfo = utils.getPluginInfo(req);

        const resource = warpjsUtils.createResource(req, {
            domain: pluginInfo.domain,
            surveyId,
            assessmentId
        });

        resource.link('docx', RoutesInfo.expand(constants.routes.docx, {}));
        resource.link('submitFeedback', RoutesInfo.expand(constants.routes.resultFeedback, {
            domain: pluginInfo.domain
        }));
        resource.link('submitEmail', RoutesInfo.expand(constants.routes.email, {
            domain: pluginInfo.domain
        }));

        try {
            const domain = await pluginInfo.warpCore.getDomainByName(pluginInfo.domain);
            const entity = domain.getEntityByName(pluginInfo.config.schema.questionnaire);
            const instance = await entity.getInstance(pluginInfo.persistence, surveyId);
            if (!instance.id) {
                throw new Error(`Cannot find Survey Tool id: ${surveyId}`);
            }
            const questionnaire = new Questionnaire();
            await questionnaire.fromPersistence(Promise, pluginInfo, entity, instance);

            const hal = await questionnaire.toHal(warpjsUtils, RoutesInfo, constants.routes, pluginInfo.domain);
            const fileSrc = path.resolve(config.public, `uploaded-files/${hal.key}-acme_asset_management.txt`);
            hal.hasSampleProject = fs.existsSync(fileSrc);

            resource.embed('questionnaires', hal);

            // create answers resource
            resource.embed('answers', questionnaire.generateDefaultAnswer(uuid).toHal(warpjsUtils));

            // Custom messages
            const customMessageEntity = domain.getEntityByName('CustomMessage');
            const customMessages = await customMessageEntity.getDocuments(pluginInfo.persistence);
            resource.embed('customMessages', customMessages
                .filter((customMessage) => customMessage.Name.startsWith('SurveyTool') || customMessage.Name.startsWith('IPT'))
                .map((customMessage) => warpjsUtils.createResource('', {
                    key: customMessage.Name,
                    value: customMessage.Message
                })));

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
