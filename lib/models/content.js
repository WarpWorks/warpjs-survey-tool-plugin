const Promise = require('bluebird');
const RoutesInfo = require('@quoin/expressjs-routes-info');
const warpjsUtils = require('@warp-works/warpjs-utils');

const Overview = require('./overview');

class Content {
    constructor(entity, instance) {
        this.id = instance.id;
        this.name = instance.Name;
        this.instance = instance;
        this.entity = entity;
    }

    toHal(domain, pluginConfig, persistence) {
        return Promise.resolve()
            .then(() => RoutesInfo.expand('entity', {type: this.instance.type, id: this.instance.id}))
            .then((href) => warpjsUtils.createResource(href, {
                id: this.id,
                name: this.name
            }))
            .then((resource) => Promise.resolve()
                .then(() => this.entity.getRelationshipByName('Overview'))
                .then((overviewRelationship) => Promise.resolve()
                    .then(() => overviewRelationship.getDocuments(persistence, this.instance))
                    .then((overviewDocuments) => Promise.resolve()
                        .then(() => console.log('overviewDocuments', overviewDocuments))
                        .then(() => overviewRelationship.targetEntity[0])
                        .then((overviewEntity) => Promise.resolve()
                            .then(() => console.log('overviewEntity', overviewEntity))
                            .then(() => overviewDocuments.map((overviewDocument) => new Overview(overviewEntity, overviewDocument)))
                            .then((overviewInstances) => Promise.map(overviewInstances, (overviewInstance) => overviewInstance.toHal(domain, pluginConfig, persistence)))
                        )
                    )
                )
                .then((overviewHAL) => resource.embed('overviews', overviewHAL))
                .then(() => resource)
            )
        ;
    }
}

module.exports = Content;
