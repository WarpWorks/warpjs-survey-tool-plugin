const Promise = require('bluebird');
const RoutesInfo = require('@quoin/expressjs-routes-info');
const warpjsUtils = require('@warp-works/warpjs-utils');

const constants = require('./../constants');
const ImageMap = require('./imageMap');

class Image {
    constructor(entity, instance) {
        this.id = instance.id;
        this.name = instance.Name;
        this.label = instance.Label;
        this.content = instance.Description;
        this.url = instance.ImageURL;
        this.height = instance.Height;
        this.width = instance.Width;
        this.instance = instance;
        this.entity = entity;
    }

    toHal(domain, pluginConfig, persistence) {
        return Promise.resolve()
            .then(() => RoutesInfo.expand(constants.routes.newQuestionnaire, {domain: domain, isatId: this.id}))
            .then((href) => warpjsUtils.createResource(href, {
                id: this.id,
                name: this.name,
                label: this.label,
                content: this.content,
                height: this.height,
                width: this.width,
                url: this.url
            }))
            .then((resource) => Promise.resolve()
                .then(() => this.entity.getRelationshipByName(pluginConfig.schema.map))
                .then((mapRelationship) => Promise.resolve()
                    .then(() => mapRelationship.getDocuments(persistence, this.instance))
                    .then((mapDocuments) => Promise.resolve()
                        .then(() => mapRelationship.targetEntity[0])
                        .then((mapEntity) => Promise.resolve()
                            .then(() => mapDocuments ? mapDocuments.map((mapDocument) => new ImageMap(mapEntity, mapDocument)) : null)
                            .then((mapInstances) => mapDocuments ? Promise.map(mapInstances, (mapInstance) => mapInstance.toHal(domain)) : null)
                        )
                    )
                )
                .then((mapHAL) => resource.embed('imageMaps', mapHAL))
            )
        ;
    }
}

module.exports = Image;
