const Promise = require('bluebird');
const RoutesInfo = require('@quoin/expressjs-routes-info');
const warpjsUtils = require('@warp-works/warpjs-utils');

const constants = require('./../constants');
const Result = require('./result');

class ResultSet {
    constructor(entity, instance) {
        this.id = instance.id;
        this.name = instance.Name;
        this.position = instance.Position;
        this.content = instance.Description;
        this.instance = instance;
        this.entity = entity;
    }

    toHal(domain, pluginConfig, persistence) {
        return Promise.resolve()
            .then(() => RoutesInfo.expand(constants.routes.newQuestionnaire, {domain: domain, isatId: this.id}))
            .then((href) => warpjsUtils.createResource(href, {
                id: this.id,
                name: this.name,
                position: this.position,
                content: this.content
            }))
            .then((resource) => Promise.resolve()
                .then(() => this.entity.getRelationshipByName(pluginConfig.schema.result))
                .then((resultRelationship) => Promise.resolve()
                    .then(() => resultRelationship.getDocuments(persistence, this.instance))
                    .then((resultDocuments) => Promise.resolve()
                        .then(() => resultRelationship.targetEntity[0])
                        .then((resultEntity) => Promise.resolve()
                            .then(() => resultDocuments.map((resultDocument) => new Result(resultEntity, resultDocument)))
                            .then((resultInstances) => Promise.map(resultInstances, (resultInstance) => resultInstance.toHal(domain, pluginConfig, persistence)))
                        )
                    )
                )
                .then((resultsHAL) => resource.embed('results', resultsHAL))
                .then(() => resource)
            )
        ;
    }
}

module.exports = ResultSet;
