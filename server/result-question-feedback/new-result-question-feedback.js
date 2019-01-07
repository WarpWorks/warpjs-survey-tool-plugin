const Promise = require('bluebird');
const uuid = require('uuid');
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
        .then((domainModel) => domainModel.getEntityByName(pluginConfig.schema.questionnaire))
        .then((questionnaireEntity) => Promise.resolve()
            .then(() => questionnaireEntity.getDocuments(persistence, {_id: questionnaireId}, true))
            .then((questionnaireDocument) => new Questionnaire(questionnaireEntity, questionnaireDocument[0]))
            .then((questionnaire) => Promise.resolve()
                .then(() => {
                    return {
                        id: uuid(),
                        questionId: req.body.questionId,
                        resultId: req.body.resultId,
                        resultsetId: req.body.resultsetId,
                        thumbValue: req.body.thumbValue,
                        comment: req.body.comment
                    };
                })
                .then((resultQuestionFeedback) => Promise.resolve()
                    .then(() => questionnaire.newResultQuestionFeedback(resultQuestionFeedback.id, resultQuestionFeedback.questionId, resultQuestionFeedback.resultId, resultQuestionFeedback.resultsetId, resultQuestionFeedback.thumbValue, resultQuestionFeedback.comment))
                    .then((feedback) => Promise.resolve()
                        .then(() => questionnaireEntity.getRelationshipByName('SurveyToolFeedback'))
                        .then((SurveyToolFeedbackRelationship) => SurveyToolFeedbackRelationship.getTargetEntity())
                        .then((SurveyToolFeedbackEntity) => Promise.resolve()
                            .then(() => SurveyToolFeedbackEntity.getRelationshipByName('Result'))
                            .then((ResultRelationship) => ResultRelationship.addAssociation(feedback, {
                                id: resultQuestionFeedback.resultId,
                                type: 'Result'
                            }))
                            .then(() => SurveyToolFeedbackEntity.getRelationshipByName('ResultSet'))
                            .then((ResultRelationship) => ResultRelationship.addAssociation(feedback, {
                                id: resultQuestionFeedback.resultsetId,
                                type: 'ResultSet'
                            }))
                            .then(() => SurveyToolFeedbackEntity.getRelationshipByName('DimensionQ'))
                            .then((ResultRelationship) => ResultRelationship.addAssociation(feedback, {
                                id: resultQuestionFeedback.questionId,
                                type: 'DimensionQ'
                            }))
                            .then(() => feedback.save(Promise, persistence, questionnaireId))
                        )
                    )
                    .then(() => warpjsUtils.createResource('', resultQuestionFeedback))
                    .then((resource) => utils.sendHal(req, res, resource))
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
