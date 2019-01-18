// const debug = require('debug')('W2:plugin:survey-tool:assessment/wizard');
const Promise = require('bluebird');
const RoutesInfo = require('@quoin/expressjs-routes-info');
const uuid = require('uuid/v4');
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
            resource.embed('questionnaires', hal);

            // create answers resource
            resource.embed('answers', questionnaire.generateDefaultAnswer(uuid).toHal(warpjsUtils));

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
