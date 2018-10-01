// const debug = require('debug')('W2:plugin:survey-tool:root/get-all-questionnaires');
const RoutesInfo = require('@quoin/expressjs-routes-info');
const warpjsUtils = require('@warp-works/warpjs-utils');

const constants = require('./../../lib/constants');
const Questionnaire = require('./../../lib/models/questionnaire');
const sendErrorHal = require('./../utils/send-error-hal');
const sendHal = require('./../utils/send-hal');

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
        const pluginConfig = req.app.get(constants.appKeys.pluginConfig);
        const domain = pluginConfig.domainName;

        const Persistence = require(pluginConfig.persistence.module);
        const persistence = new Persistence(pluginConfig.persistence.host, domain);

        const resource = warpjsUtils.createResource(req, {
            title: `Domain ${domain} - Survey Tool`,
            domain
        });

        try {
            const domainModel = await req.app.get(constants.appKeys.warpCore).getDomainByName(domain);
            const questionnaireEntity = await domainModel.getEntityByName(pluginConfig.schema.questionnaire);
            const questionnaireDocuments = await questionnaireEntity.getDocuments(persistence);
            const questionnaireInstances = questionnaireDocuments.map((questionnaireDocument) => new Questionnaire(questionnaireEntity, questionnaireDocument));
            const questionnairesHAL = questionnaireInstances.map((questionnaireInstance) => questionnaireInstance.toHal());
            resource.embed('questionnaires', questionnairesHAL);
            await sendHal(req, res, resource, RoutesInfo);
        } catch (err) {
            console.error("server/root/get-all-questionnaires: err:", err);
            await sendErrorHal(req, res, resource, err, RoutesInfo);
        } finally {
            await persistence.close();
        }
    }
});
