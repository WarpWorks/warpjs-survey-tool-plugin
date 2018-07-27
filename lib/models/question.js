const Promise = require('bluebird');
const RoutesInfo = require('@quoin/expressjs-routes-info');
const warpjsUtils = require('@warp-works/warpjs-utils');

const constants = require('./../constants');
const Option = require('./option');

class Question {
    constructor(entity, instance) {
        this.id = instance.id;
        this.content = instance.Description;
        this.position = instance.Position;
        this.detailLevel = this.convertDetailLevel(instance.Level_of_Detail);
        this.name = instance.Name;
        this.entity = entity;
        this.instance = instance;
    }

    convertDetailLevel(level) {
        let newLevel = 3;
        if (level === 'Level_Zero') {
            newLevel = 1;
        } else if (level === 'Level_One') {
            newLevel = 2;
        }

        return newLevel;
    }

    toHal(domain, pluginConfig, persistence) {
        return Promise.resolve()
            .then(() => RoutesInfo.expand(constants.routes.newQuestionnaire, {domain: domain, isatId: this.id}))
            .then((href) => warpjsUtils.createResource(href, {
                id: this.id,
                name: this.name,
                content: this.content,
                position: this.position,
                detailLevel: this.detailLevel
            }))
            .then((resource) => Promise.resolve()
                .then(() => this.entity.getRelationshipByName(pluginConfig.schema.option))
                .then((optionRelationship) => Promise.resolve()
                    .then(() => optionRelationship.getDocuments(persistence, this.instance))
                    .then((optionDocuments) => Promise.resolve()
                        .then(() => optionRelationship.targetEntity[0])
                        .then((optionEntity) => Promise.resolve()
                            .then(() => optionDocuments.map((optionDocument) => new Option(optionEntity, optionDocument)))
                            .then((optionInstances) => Promise.map(optionInstances, (optionInstance) => optionInstance.toHal(domain)))
                        )
                    )
                )
                .then((questionsHAL) => resource.embed('options', questionsHAL))
                .then(() => resource)
            )
        ;
    }
}

module.exports = Question;
