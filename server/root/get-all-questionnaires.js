// const _ = require('lodash');
const Promise = require('bluebird');
const RoutesInfo = require('@quoin/expressjs-routes-info');
const warpjsUtils = require('@warp-works/warpjs-utils');

const constants = require('./../../lib/constants');
const Questionnaire = require('./../../lib/models/questionnaire');

module.exports = (req, res) => {
    const {domain} = req.params;
    const pluginConfig = req.app.get(constants.appKeys.pluginConfig);
    const Persistence = require(pluginConfig.persistence.module);
    const persistence = new Persistence(pluginConfig.persistence.host, domain);

    const resource = warpjsUtils.createResource(req, {
        title: `Domain ${domain} - IPT`,
        domain
    });

    warpjsUtils.wrapWith406(res, {
        html: () => {
            warpjsUtils.sendIndex(res, 'Ipt',
                [
                    `${req.app.get('base-url')}/assets/${constants.assets.js}`
                ],
                `${req.app.get('base-url')}/assets/${constants.assets.css}`
            );
        },
        [warpjsUtils.constants.HAL_CONTENT_TYPE]: () => {
            Promise.resolve()
                .then(() => req.app.get(constants.appKeys.warpCore).getDomainByName(domain))
                .then((domainModel) => domainModel.getEntityByName(pluginConfig.schema.questionnaire))
                // .then((questionnaireEntity) => questionnaireEntity.getDocuments(persistence))
                // .then((questionnaires) => {
                //     console.log('questionnaires: ', questionnaires);
                //     // const resource = warpjsUtils.createResource(req, {_embedded: {questionnaires: questionnaires}});
                //     resource.embed('questionnaires', questionnaires);
                //     console.log('questionnaire resource:::: ', resource);
                //     // warpjsUtils.sendHal(req, res, resource, RoutesInfo);
                // })
                // .then((questionnaires) => resource.embed('questionnaires', questionnaires))

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
