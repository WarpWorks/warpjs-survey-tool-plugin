const Promise = require('bluebird');
const RoutesInfo = require('@quoin/expressjs-routes-info');
const warpjsUtils = require('@warp-works/warpjs-utils');

const constants = require('./../../lib/constants');

module.exports = (req, res) => {
    const {domain, type, id} = req.params;

    const warpCore = req.app.get(constants.appKeys.warpCore);

    const pluginConfig = req.app.get(constants.appKeys.pluginConfig);
    const Persistence = require(pluginConfig.persistence.module);
    const persistence = new Persistence(pluginConfig.persistence.host, domain);

    return Promise.resolve()
        .then(() => warpCore.getDomainByName(domain))
        .then((schema) => schema.getEntityByName(type))
        .then((entity) => Promise.resolve()
            .then(() => warpjsUtils.createResource(req, {
                domain,
                type,
                id,
                docLevel: req.body.docLevel
            }))
            .then((resource) => Promise.resolve()
                .then(() => entity.getInstance(persistence, id))
                .then((instance) => Promise.resolve()
                    .then(() => warpjsUtils.docLevel.getData(persistence, entity, instance, req.body.docLevel))
                    .then((docLevelData) => Promise.resolve()
                        .then(() => docLevelData.model.getRelationshipByName(constants.schema.relationship.for.imagearea))
                        .then((relationship) => Promise.map(req.body.areas, (area) => Promise.resolve()
                            .then(() => relationship.createTargetInstance())
                            .then((targetData) => {
                                targetData.instance.Coords = area;
                                targetData.instance.Shape = 'Rect';
                                return targetData.instance;
                            })
                            .then((targetInstance) => relationship.addTargetInstance(persistence, docLevelData.instance, targetInstance))
                        ))
                    )
                    .then(() => entity.updateDocument(persistence, instance))
                )
                .then(() => warpjsUtils.sendHal(req, res, resource, RoutesInfo))
            )
        )
        .catch((err) => {
            console.log("server/root/create-new-areas: err:", err);
            throw err;
        })
        .finally(() => persistence.close())
    ;
};
