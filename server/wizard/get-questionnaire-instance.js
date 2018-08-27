const Promise = require('bluebird');
const RoutesInfo = require('@quoin/expressjs-routes-info');
const uuid = require('uuid');
const warpjsUtils = require('@warp-works/warpjs-utils');

const constants = require('./../../lib/constants');
const Questionnaire = require('./../../lib/models/questionnaire');

module.exports = (req, res) => {
    const {domain, wizardId} = req.params;
    const pluginConfig = req.app.get(constants.appKeys.pluginConfig);
    const Persistence = require(pluginConfig.persistence.module);
    const persistence = new Persistence(pluginConfig.persistence.host, domain);

    warpjsUtils.wrapWith406(res, {
        html: () => {
            warpjsUtils.sendIndex(res, 'Ipt',
                [
                    `${req.app.get('base-url')}/assets/${constants.assets.wizardJs}`
                ],
                `${req.app.get('base-url')}/assets/${constants.assets.css}`
            );
        },
        [warpjsUtils.constants.HAL_CONTENT_TYPE]: () => {
            Promise.resolve()
                .then(() => persistence.documents(pluginConfig.schema.attempt, {_id: wizardId}, true))
                .then((attemptDocument) => Promise.resolve()
                    .then(() => warpjsUtils.createResource(req, attemptDocument[0]))
                    .then((resource) => Promise.resolve()
                        .then(() => req.app.get(constants.appKeys.warpCore).getDomainByName(domain))
                        .then((domainModel) => domainModel.getEntityByName(pluginConfig.schema.questionnaire))
                        .then((questionnaireEntity) => Promise.resolve()
                            .then(() => attemptDocument.length ? questionnaireEntity.getDocuments(persistence, {_id: attemptDocument[0].questionnaireId}, true) : null)
                            .then((questionnaireDocument) => questionnaireDocument ? new Questionnaire(questionnaireEntity, questionnaireDocument[0]) : null)
                            .then((questionnaireInstance) => questionnaireInstance ? questionnaireInstance.toHallFull(domain, pluginConfig, persistence) : null)
                        )
                        .then((questionnaireHAL) => questionnaireHAL ? resource.embed('questionnaires', questionnaireHAL) : null)
                        // create answers resource
                        .then(() => warpjsUtils.createResource(req, {
                            id: resource._embedded.questionnaires[0].id
                        }))
                        .then((answersResource) => Promise.resolve()
                            .then(() => resource && resource._embedded ? resource._embedded.questionnaires : null)
                            .then((questionnaires) => questionnaires ? questionnaires[0] : null)
                            .then((questionnaire) => questionnaire && questionnaire._embedded ? questionnaire._embedded.categories : null)
                            .then((categories) => Promise.map(categories, (category) => Promise.resolve()
                                .then(() => warpjsUtils.createResource(req, {
                                    id: category.id,
                                    isRepeatable: category.isRepeatable,
                                    comments: ''
                                }))
                                .then((categoryResource) => Promise.resolve()
                                    .then(() => {
                                        return category.isRepeatable ? new Array(6) : new Array(1);
                                    })
                                    .then((answerIterationsEmpty) => Promise.map(answerIterationsEmpty, () => Promise.resolve()
                                        .then(() => warpjsUtils.createResource('', {
                                            id: uuid(),
                                            name: ''
                                        }))
                                        .then((iterationResource) => Promise.resolve()
                                            .then(() => Promise.map(category._embedded.questions, (question) => Promise.resolve()
                                                .then(() => warpjsUtils.createResource('', {
                                                    id: question.id,
                                                    detailLevel: question.detailLevel,
                                                    answer: '',
                                                    comments: ''
                                                }))
                                            ))
                                            .then((answerQuestions) => iterationResource.embed('questions', answerQuestions))
                                        )
                                    ))
                                    .then((answerIterations) => categoryResource.embed('iterations', answerIterations))

                                )
                            ))
                            .then((answersCategories) => answersResource.embed('categories', answersCategories))
                            .then((answersHAL) => resource.embed('answers', answersHAL))
                        )
                        .then(() => warpjsUtils.sendHal(req, res, resource, RoutesInfo))
                    )
                )
                .catch((err) => {
                    console.error("server/root/get-all-questionnaires: err:", err);
                    throw err;
                })
                .finally(() => persistence.close())
            ;
        }
    });
};
