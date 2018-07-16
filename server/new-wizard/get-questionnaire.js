const Promise = require('bluebird');
const RoutesInfo = require('@quoin/expressjs-routes-info');
const warpjsUtils = require('@warp-works/warpjs-utils');

const constants = require('./../../lib/constants');

module.exports = (req, res) => {
    const {domain, isatId} = req.params;
    const pluginConfig = req.app.get(constants.appKeys.pluginConfig);
    const Persistence = require(pluginConfig.persistence.module);
    const persistence = new Persistence(pluginConfig.persistence.host, domain);
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
                .then((questionnaireEntity) => questionnaireEntity.getDocuments(persistence, {_id: isatId}, true))
                .then((questionnaire) => {
                    console.log('single questionnaire: ', questionnaire);
                    const resource = warpjsUtils.createResource(req, {_embedded: {questionnaire: questionnaire}});
                    console.log('questionnaire resource:::: ', resource);
                    warpjsUtils.sendHal(req, res, resource, RoutesInfo);
                })
                .catch((err) => {
                    console.error("server/root/get-all-questionnaires: err:", err);
                    throw err;
                })
                .finally(() => persistence.close())
            ;
        }
    });
};
