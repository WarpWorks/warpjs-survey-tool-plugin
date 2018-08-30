const _ = require('lodash');
const Promise = require('bluebird');
const RoutesInfo = require('@quoin/expressjs-routes-info');
const warpjsUtils = require('@warp-works/warpjs-utils');

const constants = require('./../constants');
const Image = require('./image');
const Option = require('./option');

class Question {
    constructor(entity, instance) {
        this.id = instance.id;
        this.content = instance.Description;
        this.position = instance.Position;
        this.detailLevel = this.convertDetailLevel(instance.Level_of_Detail);
        this.name = instance.Name;
        this.image = null;
        this.imageUrl = null;
        this.imgLibId = null;
        this.imageArea = instance.ImageArea;
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

    getImageResource(persistence, pluginConfig, domain) {
        return Promise.resolve()
            .then(() => this.entity.getRelationshipByName(pluginConfig.schema.image))
            .then((imageRelationship) => Promise.resolve()
                .then(() => imageRelationship.getDocuments(persistence, this.instance))
                .then((imageDocuments) => Promise.resolve()
                    .then(() => imageRelationship.getTargetEntity())
                    .then((imageEntity) => Promise.resolve()
                        .then(() => imageEntity.getRelationshipByName(pluginConfig.schema.image))
                        .then((subImageRelationship) => Promise.resolve()
                            .then(() => subImageRelationship ? subImageRelationship.getDocuments(persistence, imageDocuments.length ? imageDocuments[0] : {}) : [])
                            .then((subImageDocuments) => Promise.resolve()
                                .then(() => subImageRelationship ? subImageRelationship.getTargetEntity() : null)
                                .then((subImageEntity) => Promise.resolve()
                                    .then(() => subImageDocuments.length && subImageEntity ? new Image(subImageEntity, subImageDocuments[0]) : null)
                                    .then((subImageInstance) => {
                                        if (subImageInstance) {
                                            subImageInstance.imgLibId = imageDocuments && imageDocuments[0] ? imageDocuments[0].id : null;
                                        }

                                        return subImageInstance;
                                    })
                                )
                            )
                        )

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
                position: this.position,
                detailLevel: this.detailLevel,
                image: this.image,
                imageUrl: this.imageUrl,
                imageArea: this.imageArea
            }))
            .then((resource) => Promise.resolve()
                .then(() => this.entity.getRelationshipByName(pluginConfig.schema.option))
                .then((optionRelationship) => Promise.resolve()
                    .then(() => optionRelationship.getDocuments(persistence, this.instance))
                    .then((optionDocuments) => Promise.resolve()
                        .then(() => {
                            if (optionDocuments.length > 0) {
                                return Promise.resolve()
                                    .then(() => optionRelationship.targetEntity[0])
                                    .then((optionEntity) => Promise.resolve()
                                        .then(() => optionDocuments.map((optionDocument) => new Option(optionEntity, optionDocument)))
                                        .then((optionInstances) => Promise.map(optionInstances, (optionInstance) => optionInstance.toHal(domain)))
                                    )
                                ;
                            }
                        })
                    )
                )
                .then((optionsHAL) => _.orderBy(optionsHAL, (halOption) => {
                    return parseInt(halOption.position, 10);
                }))
                .then((optionsOrderedHAL) => resource.embed('options', optionsOrderedHAL))
                .then(() => this.getImageResource(persistence, pluginConfig, domain))
                .then((imageResource) => {
                    if (imageResource) {
                        resource.image = imageResource.id;
                        resource.imageUrl = imageResource.url;
                        resource.imgLibId = imageResource.imgLibId;
                    }
                })
                .then(() => resource)
            )
        ;
    }

    toHalRelevance(domain, pluginConfig, persistence) {
        return Promise.resolve()
            .then(() => RoutesInfo.expand(constants.routes.newQuestionnaire, {domain: domain, isatId: this.id}))
            .then((href) => warpjsUtils.createResource(href, {
                id: this.id,
                name: this.name,
                position: this.position,
                detailLevel: this.detailLevel
            }))
        ;
    }
}

module.exports = Question;
