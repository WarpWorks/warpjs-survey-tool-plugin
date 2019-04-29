const _ = require('lodash');
const Promise = require('bluebird');
const RoutesInfo = require('@quoin/expressjs-routes-info');
const warpjsUtils = require('@warp-works/warpjs-utils');

const constants = require('./../../lib/constants');
const Result = require('./../../lib/models/result');
const utils = require('./../utils');

module.exports = (req, res) => warpjsUtils.wrapWith406(res, {
    [warpjsUtils.constants.HAL_CONTENT_TYPE]: async () => {
        const {
            surveyId,
            resultsetId,
            resultId,
            thumbDirection
        } = req.params;
        const pluginInfo = utils.getPluginInfo(req);
        const resource = warpjsUtils.createResource(req, {
            domain: pluginInfo.domain,
            thumbDirection,
            resultId
        });

        const Persistence = require(pluginInfo.config.persistence.module);
        const persistence = new Persistence(pluginInfo.config.persistence.host, pluginInfo.domain);

        try {
            const domainModel = await pluginInfo.warpCore.getDomainByName(pluginInfo.domain);
            const resultEntity = await domainModel.getEntityByName(pluginInfo.config.schema.result);
            const resultInstance = await resultEntity.getInstance(pluginInfo.persistence, resultId);

            const resultModel = new Result();
            await resultModel.fromPersistence(Promise, pluginInfo, resultEntity, resultInstance);
            const resultHAL = await resultModel.toHalResultFeedbackSpecific(warpjsUtils, RoutesInfo, constants.routes, thumbDirection);

            const questionnaireEntity = await domainModel.getEntityByName(pluginInfo.config.schema.questionnaire);
            const questionnaireDocument = await questionnaireEntity.getDocuments(persistence, {_id: surveyId}, true);
            const feedbackRelationship = await questionnaireEntity.getRelationshipByName(pluginInfo.config.schema.surveyToolFeedback);
            const feedbackDocuments = await feedbackRelationship.getDocuments(persistence, questionnaireDocument[0]);
            const filteredFeedback = _.filter(feedbackDocuments, (feedbackDocument) => {
                const matchesThumbDirection = feedbackDocument.ThumbDirection === thumbDirection;
                const matchesAssociations = feedbackDocument.associations && feedbackDocument.associations.length === 2 && feedbackDocument.FeedbackType === 'result' && feedbackDocument.associations[0].data[0]._id === resultId && feedbackDocument.associations[1].data[0]._id === resultsetId;

                return matchesThumbDirection && matchesAssociations;
            });

            await resultHAL.embed('feedbacks', filteredFeedback.map((feedback) => {
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

            await resource.embed('feedbackQuestions', resultHAL);
            await utils.sendHal(req, res, resource);
        } catch (err) {
            console.error("server/root/get-questions: err:", err);
            await utils.sendErrorHal(req, res, resource, err);
        } finally {
            await pluginInfo.persistence.close();
        }
    }
});
