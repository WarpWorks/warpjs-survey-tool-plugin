const _ = require('lodash');
const Promise = require('bluebird');
const RoutesInfo = require('@quoin/expressjs-routes-info');
const warpjsUtils = require('@warp-works/warpjs-utils');

const constants = require('./../../lib/constants');
const Question = require('./../../lib/models/question');
const utils = require('./../utils');

module.exports = (req, res) => warpjsUtils.wrapWith406(res, {
    [warpjsUtils.constants.HAL_CONTENT_TYPE]: async () => {
        const {
            surveyId,
            resultsetId,
            resultId,
            questionId,
            thumbDirection
        } = req.params;
        const pluginInfo = utils.getPluginInfo(req);
        const resource = warpjsUtils.createResource(req, {
            domain: pluginInfo.domain,
            questionId,
            thumbDirection,
            resultId
        });

        const Persistence = require(pluginInfo.config.persistence.module);
        const persistence = new Persistence(pluginInfo.config.persistence.host, pluginInfo.domain);

        try {
            const domainModel = await pluginInfo.warpCore.getDomainByName(pluginInfo.domain);
            const questionEntity = await domainModel.getEntityByName(pluginInfo.config.schema.question);
            const questionInstance = await questionEntity.getInstance(pluginInfo.persistence, questionId);

            const questionModel = new Question();
            await questionModel.fromPersistence(Promise, pluginInfo, questionEntity, questionInstance);
            const questionHAL = await questionModel.toHalResultFeedbackSpecific(warpjsUtils, RoutesInfo, constants.routes, resultId, thumbDirection);

            const questionnaireEntity = await domainModel.getEntityByName(pluginInfo.config.schema.questionnaire);
            const questionnaireDocument = await questionnaireEntity.getDocuments(persistence, { _id: surveyId }, true);
            const feedbackRelationship = await questionnaireEntity.getRelationshipByName(pluginInfo.config.schema.surveyToolFeedback);
            const feedbackDocuments = await feedbackRelationship.getDocuments(persistence, questionnaireDocument[0]);
            const filteredFeedback = _.filter(feedbackDocuments, (document) => {
                const matchesThumbDirection = document.ThumbDirection === thumbDirection;
                const matchesAssociations = document.associations && document.associations.length === 3 && document.associations[0].data[0]._id === resultId && document.associations[1].data[0]._id === resultsetId && document.associations[2].data[0]._id === questionId;

                return matchesThumbDirection && matchesAssociations;
            });

            await questionHAL.embed('feedbacks', filteredFeedback.map((feedback) => {
                const date = new Date(feedback.lastUpdated);
                const feedbackResource = warpjsUtils.createResource('', {
                    id: feedback.id,
                    comment: feedback.Comment,
                    thumbDirection: feedback.ThumbDirection,
                    typeID: feedback.typeID,
                    parentID: feedback.parentID,
                    date: date.toString()
                });

                return feedbackResource;
            }));

            await resource.embed('feedbackQuestions', questionHAL);
            await utils.sendHal(req, res, resource);
        } catch (err) {
            console.error("server/root/get-questions: err:", err);
            await utils.sendErrorHal(req, res, resource, err);
        } finally {
            await pluginInfo.persistence.close();
        }
    }
});
