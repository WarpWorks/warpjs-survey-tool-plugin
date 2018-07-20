const Promise = require('bluebird');
const RoutesInfo = require('@quoin/expressjs-routes-info');
const warpjsUtils = require('@warp-works/warpjs-utils');

const constants = require('./../../lib/constants');
const Questionnaire = require('./../../lib/models/questionnaire');

module.exports = (req, res) => {
    const {domain, wizardId} = req.params;
    const pluginConfig = req.app.get(constants.appKeys.pluginConfig);
    const Persistence = require(pluginConfig.persistence.module);
    const persistence = new Persistence(pluginConfig.persistence.host, domain);
    let resource;

    warpjsUtils.wrapWith406(res, {
        html: () => {
            warpjsUtils.sendIndex(res, 'Ipt',
                [
                    `${req.app.get('base-url')}/assets/${constants.assets.wizardJs}`
                ],
                `${req.app.get('base-url')}/assets/${constants.assets.css}`
            );
        },
        [warpjsUtils.constants.HAL_CONTENT_TYPE]: () => {
            Promise.resolve()
                .then(() => persistence.documents(pluginConfig.schema.attempt, {_id: wizardId}, true))
                .then((attemptDocument) => Promise.resolve()
                    .then(() => {
                        resource = warpjsUtils.createResource(req, attemptDocument[0]);
                    })
                    .then(() => req.app.get(constants.appKeys.warpCore).getDomainByName(domain))
                    .then((domainModel) => domainModel.getEntityByName(pluginConfig.schema.questionnaire))
                    .then((questionnaireEntity) => Promise.resolve()
                        .then(() => questionnaireEntity.getDocuments(persistence, {_id: attemptDocument[0].questionnaireId}, true))
                        .then((questionnaireDocument) => new Questionnaire(questionnaireEntity, questionnaireDocument[0]))
                    )
                    .then((questionnaireInstance) => questionnaireInstance.toHal(domain)))
                .then((questionnaireHAL) => resource.embed('questionnaire', questionnaireHAL))
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
