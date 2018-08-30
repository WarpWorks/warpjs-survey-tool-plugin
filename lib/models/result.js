const Promise = require('bluebird');
const RoutesInfo = require('@quoin/expressjs-routes-info');
const warpjsUtils = require('@warp-works/warpjs-utils');

const constants = require('./../constants');
const Content = require('./content');
const Question = require('./question');

class Result {
    constructor(entity, instance) {
        this.id = instance.id;
        this.name = instance.Name;
        this.instance = instance;
        this.entity = entity;
    }

    toHal(domain, pluginConfig, persistence) {
        return Promise.resolve()
            .then(() => RoutesInfo.expand(constants.routes.newQuestionnaire, {domain: domain, isatId: this.id}))
            .then((href) => warpjsUtils.createResource(href, {
                id: this.id,
                name: this.name
            }))
            .then((resource) => Promise.resolve()
                // relevant if high
                .then(() => this.entity.getRelationshipByName(pluginConfig.schema.relevantHigh))
                .then((relevantHighRelationship) => Promise.resolve()
                    .then(() => relevantHighRelationship.getDocuments(persistence, this.instance))
                    .then((relevantHighDocuments) => Promise.resolve()
                        .then(() => relevantHighRelationship.targetEntity[0])
                        .then((relevantHighEntity) => Promise.resolve()
                            .then(() => relevantHighDocuments.map((relevantHighDocument) => new Question(relevantHighEntity, relevantHighDocument)))
                            .then((relevantHighInstances) => Promise.map(relevantHighInstances, (relevantHighInstance) => relevantHighInstance.toHalRelevance(domain, pluginConfig, persistence)))
                        )
                    )
                )
                .then((relevantHighsHAL) => resource.embed('relevantHighs', relevantHighsHAL))
                // relevant if low
                .then(() => this.entity.getRelationshipByName(pluginConfig.schema.relevantLow))
                .then((relevantLowRelationship) => Promise.resolve()
                    .then(() => relevantLowRelationship.getDocuments(persistence, this.instance))
                    .then((relevantLowDocuments) => Promise.resolve()
                        .then(() => relevantLowRelationship.targetEntity[0])
                        .then((relevantLowEntity) => Promise.resolve()
                            .then(() => relevantLowDocuments.map((relevantLowDocument) => new Question(relevantLowEntity, relevantLowDocument)))
                            .then((relevantLowInstances) => Promise.map(relevantLowInstances, (relevantLowInstance) => relevantLowInstance.toHalRelevance(domain, pluginConfig, persistence)))
                        )
                    )
                )
                .then((relevantLowsHAL) => resource.embed('relevantLows', relevantLowsHAL))
                .then(() => resource)
                // content
                .then(() => this.entity.getRelationshipByName(pluginConfig.schema.content))
                .then((contentRelationship) => Promise.resolve()
                    .then(() => contentRelationship.getDocuments(persistence, this.instance))
                    .then((contentDocuments) => Promise.resolve()
                        .then(() => contentRelationship.targetEntity[0])
                        .then((contentEntity) => Promise.resolve()
                            .then(() => contentDocuments ? contentDocuments.map((contentDocument) => new Content(contentEntity, contentDocument)) : null)
                            .then((contentInstances) => contentInstances ? Promise.map(contentInstances, (contentInstance) => contentInstance.toHal(domain, pluginConfig, persistence)) : null)
                        )
                    )
                )
                .then((contentsHAL) => resource.embed('contents', contentsHAL))
                .then(() => resource)
            )
        ;
    }
}

module.exports = Result;
