const _ = require('lodash');
const Promise = require('bluebird');
const RoutesInfo = require('@quoin/expressjs-routes-info');
const warpjsUtils = require('@warp-works/warpjs-utils');

const Category = require('./category');
const constants = require('./../constants');
const Imglib = require('./imglib');

class Questionnaire {
    constructor(entity, instance) {
        this.id = instance.id;
        this.name = instance.Name;
        this.entity = entity;
        this.instance = instance;
    }

    toHal(domain) {
        const href = RoutesInfo.expand(constants.routes.newQuestionnaire, {domain: domain, isatId: this.id});
        const resource = warpjsUtils.createResource(href, {
            id: this.id,
            name: this.name
        });

        return resource;
    }

    toHallFull(domain, pluginConfig, persistence) {
        return Promise.resolve()
            .then(() => RoutesInfo.expand(constants.routes.newQuestionnaire, {domain: domain, isatId: this.id}))
            .then((href) => warpjsUtils.createResource(href, {
                id: this.id,
                name: this.name
            }))
            .then((resource) => Promise.resolve()
                // get categories
                .then(() => this.entity.getRelationshipByName(pluginConfig.schema.category))
                .then((categoryRelationship) => categoryRelationship.getTargetEntity())
                .then((categoryEntity) => Promise.resolve()
                    .then(() => categoryEntity.getDocuments(persistence, {parentID: this.id}, true))
                    .then((categoryDocuments) => categoryDocuments.map((categoryDocument) => new Category(categoryEntity, categoryDocument)))
                    .then((categoryInstances) => Promise.map(categoryInstances, (categoryInstance) => categoryInstance.toHal(domain, pluginConfig, persistence)))
                    .then((categoriesHAL) => _.orderBy(categoriesHAL, ['position'], ['asc']))
                )
                .then((categoriesOrderedHAL) => resource.embed('categories', categoriesOrderedHAL))
                // get images
                .then(() => this.entity.getRelationshipByName(pluginConfig.schema.imageLibrary))
                .then((imageLibraryRelationship) => imageLibraryRelationship.targetEntity[0])
                .then((imageLibraryEntity) => Promise.resolve()
                    .then(() => imageLibraryEntity.getDocuments(persistence))
                    .then((imageLibraryDocuments) => Promise.resolve()
                        .then(() => imageLibraryDocuments ? imageLibraryDocuments.map((imageLibraryDocument) => new Imglib(imageLibraryEntity, imageLibraryDocument)) : null)
                        .then((imageLibraryInstances) => imageLibraryInstances ? Promise.map(imageLibraryInstances, (imageLibraryInstance) => imageLibraryInstance.toHal(domain, pluginConfig, persistence)) : null)
                        .then((imageLibraryHal) => imageLibraryHal ? resource.embed('imageLibraries', imageLibraryHal) : null)
                    )
                )

                .then(() => resource)
            )
        ;
    }

    setNewAttempt(persistence, collection, data) {
        return Promise.resolve()
            .then(() => persistence.save(collection, data))
            .then((saveResult) => saveResult.id)
        ;
    }
}

module.exports = Questionnaire;
