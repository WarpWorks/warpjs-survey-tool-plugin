const _ = require('lodash');
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
        this.image = null;
        this.imageUrl = null;
        this.imgLibId = null;
        this.imageArea = instance.ImageArea;
        this.instance = instance;
        this.entity = entity;
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
                            .then(() => subImageRelationship.getDocuments(persistence, imageDocuments.length ? imageDocuments[0] : {}))
                            .then((subImageDocuments) => Promise.resolve()
                                .then(() => subImageRelationship.getTargetEntity())
                                .then((subImageEntity) => Promise.resolve()
                                    .then(() => subImageDocuments.length ? new Image(subImageEntity, subImageDocuments[0], imageDocuments.id) : null)
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
                isRepeatable: this.isRepeatable,
                imageArea: this.imageArea
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
                .then((questionsHAL) => _.orderBy(questionsHAL, ['position'], ['asc']))
                .then((questionsOrderedHAL) => resource.embed('questions', questionsOrderedHAL))
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
}

module.exports = Category;
