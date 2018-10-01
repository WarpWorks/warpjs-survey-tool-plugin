// const debug = require('debug')('W2:plugin:survey-tool:root/get-all-questionnaires');
const Promise = require('bluebird');
const RoutesInfo = require('@quoin/expressjs-routes-info');
const warpjsUtils = require('@warp-works/warpjs-utils');

const constants = require('./../../lib/constants');
const Questionnaire = require('./../../lib/models/questionnaire');

module.exports = (req, res) => {
    const pluginConfig = req.app.get(constants.appKeys.pluginConfig);
    const domain = pluginConfig.domainName;

    const resource = warpjsUtils.createResource(req, {
        title: `Domain ${domain} - Survey Tool`,
        domain
    });

    warpjsUtils.wrapWith406(res, {
        html: () => {
            warpjsUtils.sendIndex(req, res, RoutesInfo, 'Ipt',
                [
                    `${req.app.get('base-url')}/assets/${constants.assets.surveys}`
                ],
                `${req.app.get('base-url')}/assets/${constants.assets.css}`
            );
        },
        [warpjsUtils.constants.HAL_CONTENT_TYPE]: () => {
            const Persistence = require(pluginConfig.persistence.module);
            const persistence = new Persistence(pluginConfig.persistence.host, domain);

            Promise.resolve()
                .then(() => req.app.get(constants.appKeys.warpCore).getDomainByName(domain))
                .then((domainModel) => domainModel.getEntityByName(pluginConfig.schema.questionnaire))
                .then((questionnaireEntity) => Promise.resolve()
                    .then(() => questionnaireEntity.getDocuments(persistence))
                    .then((questionnaireDocuments) => questionnaireDocuments.map((questionnaireDocument) => new Questionnaire(questionnaireEntity, questionnaireDocument)))
                )
                .then((questionnaireInstances) => questionnaireInstances.map((questionnaireInstance) => questionnaireInstance.toHal()))
                .then((questionnairesHAL) => resource.embed('questionnaires', questionnairesHAL))
                .then(() => warpjsUtils.sendHal(req, res, resource, RoutesInfo))
                .catch((err) => {
                    console.error("server/root/get-all-questionnaires: err:", err);
                    throw err;
                })
                .finally(() => persistence.close())
            ;
        }
    });
};
