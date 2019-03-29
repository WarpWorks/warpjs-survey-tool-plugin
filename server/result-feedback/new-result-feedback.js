const Promise = require('bluebird');
const warpjsUtils = require('@warp-works/warpjs-utils');

const constants = require('./../../lib/constants');
const Questionnaire = require('./../../lib/models/questionnaire');
const utils = require('./../utils');

module.exports = (req, res) => {
    const pluginInfo = utils.getPluginInfo(req);
    const domain = pluginInfo.domain;
    const {questionnaireId} = req.body;
    const pluginConfig = req.app.get(constants.appKeys.pluginConfig);
    const Persistence = require(pluginConfig.persistence.module);
    const persistence = new Persistence(pluginConfig.persistence.host, domain);

    return Promise.resolve()
        .then(() => req.app.get(constants.appKeys.warpCore).getDomainByName(domain))
        .then((domainModel) => Promise.resolve()
            .then(() => domainModel.getEntityByName(pluginConfig.schema.questionnaire))
            .then((questionnaireEntity) => Promise.resolve()
                .then(() => questionnaireEntity.getDocuments(persistence, {_id: questionnaireId}, true))
                .then((questionnaireDocument) => new Questionnaire(questionnaireEntity, questionnaireDocument[0]))
                .then((questionnaire) => Promise.resolve()
                    .then(() => {
                        return {
                            questionId: req.body.questionId,
                            resultId: req.body.resultId,
                            resultsetId: req.body.resultsetId,
                            thumbValue: req.body.thumbValue,
                            comment: req.body.comment,
                            feedbackId: req.body.feedbackId,
                            feedbackType: req.body.feedbackType,
                            basedOn: req.body.basedOn,
                            questionSpecific: req.body.questionSpecific
                        };
                    })
                    .then((resultQuestionFeedback) => Promise.resolve()
                        .then(() => {
                            if (resultQuestionFeedback.feedbackId) {
                                return Promise.resolve()
                                    .then(() => domainModel.getEntityByName(pluginInfo.config.schema.surveyToolFeedback))
                                    .then((feedbackEntity) => Promise.resolve()
                                        .then(() => feedbackEntity.getInstance(persistence, resultQuestionFeedback.feedbackId))
                                        .then((feedbackInstance) => {
                                            feedbackInstance.Comment = resultQuestionFeedback.comment;
                                            feedbackInstance.ThumbDirection = resultQuestionFeedback.thumbValue;
                                            feedbackInstance.BasedOn = resultQuestionFeedback.basedOn;
                                            feedbackInstance.QuestionSpecific = resultQuestionFeedback.questionSpecific;

                                            return feedbackInstance;
                                        })
                                        .then((feedbackInstance) => feedbackEntity.updateDocument(persistence, feedbackInstance))
                                    )
                                ;
                            } else {
                                return Promise.resolve()
                                    .then(() => domainModel.getEntityByName(pluginInfo.config.schema.surveyToolFeedback))
                                    .then((feedbackEntity) => questionnaire.newResultFeedback(feedbackEntity.id, resultQuestionFeedback.thumbValue, resultQuestionFeedback.comment, resultQuestionFeedback.feedbackType, resultQuestionFeedback.basedOn, resultQuestionFeedback.questionSpecific))
                                    .then((feedback) => Promise.resolve()
                                        .then(() => questionnaireEntity.getRelationshipByName(pluginInfo.config.schema.surveyToolFeedback))
                                        .then((SurveyToolFeedbackRelationship) => SurveyToolFeedbackRelationship.getTargetEntity())
                                        .then((SurveyToolFeedbackEntity) => Promise.resolve()
                                            .then(() => {
                                                if (resultQuestionFeedback.resultId) {
                                                    Promise.resolve()
                                                        .then(() => SurveyToolFeedbackEntity.getRelationshipByName(pluginInfo.config.schema.result))
                                                        .then((ResultRelationship) => ResultRelationship.addAssociation(feedback, {
                                                            id: resultQuestionFeedback.resultId,
                                                            type: 'Result'
                                                        }, persistence))
                                                    ;
                                                }
                                            })
                                            .then(() => {
                                                if (resultQuestionFeedback.resultsetId) {
                                                    Promise.resolve()
                                                        .then(() => SurveyToolFeedbackEntity.getRelationshipByName(pluginInfo.config.schema.resultSet))
                                                        .then((ResultRelationship) => ResultRelationship.addAssociation(feedback, {
                                                            id: resultQuestionFeedback.resultsetId,
                                                            type: 'ResultSet'
                                                        }, persistence))
                                                    ;
                                                }
                                            })
                                            .then(() => {
                                                if (resultQuestionFeedback.questionId) {
                                                    Promise.resolve()
                                                        .then(() => SurveyToolFeedbackEntity.getRelationshipByName(pluginInfo.config.schema.question))
                                                        .then((ResultRelationship) => ResultRelationship.addAssociation(feedback, {
                                                            id: resultQuestionFeedback.questionId,
                                                            type: 'DimensionQ'
                                                        }, persistence))
                                                    ;
                                                }
                                            })
                                            .then(() => feedback)
                                        )
                                    )
                                    .then((feedback) => feedback.save(Promise, persistence, questionnaireId))
                                    .then((feedbackId) => {
                                        resultQuestionFeedback.feedbackId = feedbackId;
                                    })
                                ;
                            }
                        })
                        .then(() => warpjsUtils.createResource('', resultQuestionFeedback))
                        .then((resource) => utils.sendHal(req, res, resource))
                    )
                )
            )
        )
        .catch((err) => {
            // eslint-disable-next-line no-console
            console.error("server/root/new-result-question-feedback: err:", err);
            throw err;
        })
        .finally(() => persistence.close())
    ;
};
