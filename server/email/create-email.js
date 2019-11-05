const Promise = require('bluebird');
const warpjsUtils = require('@warp-works/warpjs-utils');

const constants = require('./../../lib/constants');
const Questionnaire = require('./../../lib/models/questionnaire');
const utils = require('./../utils');

module.exports = async (req, res) => {
    const pluginInfo = utils.getPluginInfo(req);
    const domain = pluginInfo.domain;
    const { questionnaireId } = req.body;

    const pluginConfig = req.app.get(constants.appKeys.pluginConfig);
    const Persistence = require(pluginConfig.persistence.module);
    const persistence = new Persistence(pluginConfig.persistence.host, domain);

    return Promise.resolve()
        .then(() => req.app.get(constants.appKeys.warpCore).getDomainByName(domain))
        .then((domainModel) => Promise.resolve()
            .then(() => domainModel.getEntityByName(pluginConfig.schema.questionnaire))
            .then((questionnaireEntity) => Promise.resolve()
                .then(() => questionnaireEntity.getDocuments(persistence, { _id: questionnaireId }, true))
                .then((questionnaireDocument) => new Questionnaire(questionnaireEntity, questionnaireDocument[0]))
                .then((questionnaire) => Promise.resolve()
                    .then(() => {
                        return {
                            fullName: req.body.fullName,
                            email: req.body.email
                        };
                    })
                    .then((emailValues) => Promise.resolve()
                        .then(() => domainModel.getEntityByName(pluginInfo.config.schema.email))
                        .then((emailEntity) => questionnaire.newEmail(emailEntity.id, emailValues.fullName, emailValues.email))
                        .then((newEmail) => newEmail.save(Promise, persistence, questionnaireId))
                        .then((newEmailId) => {
                            emailValues.emailId = newEmailId;
                        })
                        .then(() => warpjsUtils.createResource('', emailValues))
                        .then((resource) => utils.sendHal(req, res, resource))
                    )
                )
            )
        )
        .catch((err) => {
            // eslint-disable-next-line no-console
            console.error("server/root/new-email: err:", err);
            throw err;
        })
        .finally(() => persistence.close())
    ;
};
