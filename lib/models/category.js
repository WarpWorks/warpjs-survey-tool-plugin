const Promise = require('bluebird');
const RoutesInfo = require('@quoin/expressjs-routes-info');
const warpjsUtils = require('@warp-works/warpjs-utils');

const constants = require('./../constants');
const Question = require('./question');
const Image = require('./image');

class Category {
    constructor(entity, instance) {
        this.id = instance.id;
        this.content = instance.Description;
        this.position = instance.Position;
        this.isRepeatable = instance.isRepeatable;
        this.name = instance.Name;
        this.instance = instance;
        this.entity = entity;
    }

    getImageHal(entity, instance, persistence, pluginConfig, domain) {
        return Promise.resolve()
            .then(() => entity.getRelationshipByName(pluginConfig.schema.image))
            .then((imageRelationship) => Promise.resolve()
                .then(() => imageRelationship.getDocuments(persistence, instance))
                .then((imageDocuments) => Promise.resolve()
                    .then(() => imageRelationship.targetEntity[0])
                    .then((imageEntity) => Promise.resolve()
                        .then(() => imageEntity.getRelationshipByName(pluginConfig.schema.image))
                        .then((subImageRelationship) => Promise.resolve()
                            .then(() => subImageRelationship.getDocuments(persistence, imageDocuments[0]))
                            .then((subImageDocuments) => Promise.resolve()
                                .then(() => subImageRelationship.targetEntity[0])
                                .then((subImageEntity) => Promise.resolve()
                                    .then(() => new Image(subImageEntity, subImageDocuments[0]))
                                )
                            )
                        )
                        .then((imageInstance) => imageInstance.toHal(domain, pluginConfig, persistence))
                    )
                )
            )
        ;
    }

    toHal(domain, pluginConfig, persistence) {
        return Promise.resolve()
            .then(() => RoutesInfo.expand(constants.routes.newQuestionnaire, {domain: domain, isatId: this.id}))
            .then((href) => warpjsUtils.createResource(href, {
                id: this.id,
                name: this.name,
                content: this.content,
                isRepeatable: this.isRepeatable
            }))
            .then((resource) => Promise.resolve()
                .then(() => this.entity.getRelationshipByName(pluginConfig.schema.question))
                .then((questionRelationship) => Promise.resolve()
                    .then(() => questionRelationship.getDocuments(persistence, this.instance))
                    .then((questionDocuments) => Promise.resolve()
                        .then(() => questionRelationship.targetEntity[0])
                        .then((questionEntity) => Promise.resolve()
                            .then(() => questionDocuments.map((questionDocument) => new Question(questionEntity, questionDocument)))
                            .then((questionInstances) => Promise.map(questionInstances, (questionInstance) => questionInstance.toHal(domain, pluginConfig, persistence)))
                        )
                    )
                )
                .then((questionsHAL) => resource.embed('questions', questionsHAL))
                .then(() => this.getImageHal(this.entity, this.instance, persistence, pluginConfig, domain))
                .then((imageHAL) => resource.embed('images', imageHAL))
                .then(() => resource)
            )
        ;
    }
}

module.exports = Category;
