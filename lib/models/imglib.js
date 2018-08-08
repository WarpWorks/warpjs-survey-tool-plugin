const Promise = require('bluebird');
const RoutesInfo = require('@quoin/expressjs-routes-info');
const warpjsUtils = require('@warp-works/warpjs-utils');

const constants = require('./../constants');
const Image = require('./image');

class Imglib {
    constructor(entity, instance) {
        this.id = instance.id;
        this.name = instance.Name;
        this.label = instance.Label;
        this.content = instance.Description;
        this.instance = instance;
        this.entity = entity;
    }

    toHal(domain, pluginConfig, persistence) {
        return Promise.resolve()
            .then(() => RoutesInfo.expand(constants.routes.newQuestionnaire, {domain: domain, isatId: this.id}))
            .then((href) => warpjsUtils.createResource(href, {
                id: this.id
            }))
            .then((resource) => Promise.resolve()
                .then(() => this.entity.getRelationshipByName(pluginConfig.schema.image))
                .then((imageRelationship) => Promise.resolve()
                    .then(() => imageRelationship.getDocuments(persistence, this.instance))
                    .then((imageDocuments) => Promise.resolve()
                        .then(() => imageRelationship.targetEntity[0])
                        .then((imageEntity) => Promise.resolve()
                            .then(() => imageDocuments.length ? new Image(imageEntity, imageDocuments[0]) : null)
                            .then((imageInstance) => imageInstance ? imageInstance.toHal(domain, pluginConfig, persistence) : null)
                        )
                    )
                )
                .then((imageHAL) => resource.embed('images', imageHAL))
            )
        ;
    }
}

module.exports = Imglib;
