const Promise = require('bluebird');
const RoutesInfo = require('@quoin/expressjs-routes-info');
const warpjsUtils = require('@warp-works/warpjs-utils');

const constants = require('./../constants');
const Question = require('./question');

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
                .then(() => resource)
            )
        ;
    }
}

module.exports = Category;
