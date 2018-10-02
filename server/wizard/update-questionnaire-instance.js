const Promise = require('bluebird');
const RoutesInfo = require('@quoin/expressjs-routes-info');
const warpjsUtils = require('@warp-works/warpjs-utils');

const constants = require('./../../lib/constants');
const Questionnaire = require('./../../lib/models/questionnaire');
const utils = require('./../utils');

module.exports = (req, res) => {
    const {domain, isatId} = req.params;

    const pluginConfig = req.app.get(constants.appKeys.pluginConfig);
    const Persistence = require(pluginConfig.persistence.module);
    const persistence = new Persistence(pluginConfig.persistence.host, domain);

    return Promise.resolve()
        .then(() => req.app.get(constants.appKeys.warpCore).getDomainByName(domain))
        .then((domainModel) => domainModel.getEntityByName(pluginConfig.schema.questionnaire))
        .then((questionnaireEntity) => Promise.resolve()
            .then(() => questionnaireEntity.getDocuments(persistence, {_id: isatId}, true))
            .then((questionnaireDocument) => new Questionnaire(questionnaireEntity, questionnaireDocument[0]))
            .then((questionnaire) => Promise.resolve()
                .then(() => {
                    return {
                        levelOfDetail: 1,
                        projectName: '',
                        mainContact: '',
                        projectStatus: '',
                        solutionCanvas: '',
                        questionnaireId: isatId
                    };
                })
                .then((questionnaireAttempt) => Promise.resolve()
                    .then(() => questionnaire.setNewAttempt(persistence, pluginConfig.schema.attempt, questionnaireAttempt))
                    .then((attemptId) => {
                        const href = RoutesInfo.expand(constants.routes.wizard, {domain: domain, wizardId: attemptId});
                        return warpjsUtils.createResource(href, questionnaireAttempt);
                    })
                    .then((resource) => utils.sendHal(req, res, resource))
                )
            )
        )
        .catch((err) => {
            // eslint-disable-next-line no-console
            console.error("server/root/get-all-questionnaires: err:", err);
            throw err;
        })
        .finally(() => persistence.close())
    ;
};
