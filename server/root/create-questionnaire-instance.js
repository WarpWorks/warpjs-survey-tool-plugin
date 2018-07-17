const Promise = require('bluebird');
const RoutesInfo = require('@quoin/expressjs-routes-info');
const warpjsUtils = require('@warp-works/warpjs-utils');

const constants = require('./../../lib/constants');
// const Questionnaire = require('./../../lib/models/questionnaire');

module.exports = (req, res) => {
    const {domain, isatId} = req.params;
    const pluginConfig = req.app.get(constants.appKeys.pluginConfig);
    const Persistence = require(pluginConfig.persistence.module);
    const persistence = new Persistence(pluginConfig.persistence.host, domain);

    const resource = warpjsUtils.createResource(req, {
        title: `Domain ${domain} - IPT Instance ${isatId}`,
        domain
    });

    return Promise.resolve()
        // .then(() => req.app.get(constants.appKeys.warpCore).getDomainByName(domain))
        // .then((domainModel) => domainModel.getEntityByName(pluginConfig.schema.questionnaire))
        // .then((questionnaireEntity) => Promise.resolve()
        //     .then(() => questionnaireEntity.getDocuments(persistence))
        //     .then((questionnaireDocuments) => questionnaireDocuments.map((questionnaireDocument) => new Questionnaire(questionnaireEntity, questionnaireDocument)))
        // )
        // .then((questionnaireInstances) => questionnaireInstances.map((questionnaireInstance) => questionnaireInstance.toHal()))
        // .then((questionnairesHAL) => resource.embed('questionnaires', questionnairesHAL))
        .then(() => warpjsUtils.sendHal(req, res, resource, RoutesInfo))
        .catch((err) => {
            console.error("server/root/get-all-questionnaires: err:", err);
            throw err;
        })
        .finally(() => persistence.close())
    ;
};
