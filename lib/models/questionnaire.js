const Promise = require('bluebird');
const RoutesInfo = require('@quoin/expressjs-routes-info');
const warpjsUtils = require('@warp-works/warpjs-utils');

const Category = require('./category');
const constants = require('./../constants');

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
                .then(() => this.entity.getRelationshipByName(pluginConfig.schema.category))
                .then((categoryRelationship) => categoryRelationship.targetEntity[0])
                .then((categoryEntity) => Promise.resolve()
                    .then(() => categoryEntity.getDocuments(persistence, {parentID: this.id}, true))
                    .then((categoryDocuments) => categoryDocuments.map((categoryDocument) => new Category(categoryEntity, categoryDocument)))
                    .then((categoryInstances) => Promise.map(categoryInstances, (categoryInstance) => categoryInstance.toHal(domain, pluginConfig, persistence)))
                )
                .then((categoriesHAL) => resource.embed('categories', categoriesHAL))
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

    setAttemptName(persistence) {

    }

    SetAttemptLevel(persistence) {

    }
}

module.exports = Questionnaire;
