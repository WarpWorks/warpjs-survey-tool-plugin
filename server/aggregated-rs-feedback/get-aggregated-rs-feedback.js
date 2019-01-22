// const debug = require('debug')('W2:plugin:survey-tool:root/get-all-questionnaires');
const _ = require('lodash');
const Promise = require('bluebird');
const RoutesInfo = require('@quoin/expressjs-routes-info');
const warpjsUtils = require('@warp-works/warpjs-utils');

const constants = require('./../../lib/constants');
// const middlewares = require('./middlewares');
const ResultSet = require('./../../lib/models/result-set');
const utils = require('./../utils');

module.exports = (req, res) => warpjsUtils.wrapWith406(res, {
    html: () => {
        warpjsUtils.sendIndex(req, res, RoutesInfo, 'Ipt',
            [
                `${req.app.get('base-url')}/assets/${constants.assets.aggregatedRsFeedback}`
            ],
            `${req.app.get('base-url')}/assets/${constants.assets.css}`
        );
    },
    [warpjsUtils.constants.HAL_CONTENT_TYPE]: async () => {
        const { surveyId, typeId } = req.params;
        const pluginInfo = utils.getPluginInfo(req);
        const resource = warpjsUtils.createResource(req, {
            domain: pluginInfo.domain,
            typeId
        });

        const Persistence = require(pluginInfo.config.persistence.module);
        const persistence = new Persistence(pluginInfo.config.persistence.host, pluginInfo.domain);

        try {
            const domainModel = await pluginInfo.warpCore.getDomainByName(pluginInfo.domain);
            const typeEntity = await domainModel.getEntityByName(pluginInfo.config.schema.resultSet);
            const typeInstance = await typeEntity.getInstance(pluginInfo.persistence, typeId);

            const typeModel = new ResultSet();
            await typeModel.fromPersistence(Promise, pluginInfo, typeEntity, typeInstance);
            const typeHAL = await typeModel.toHal(warpjsUtils, RoutesInfo, constants.routes, pluginInfo.domain, surveyId);

            const questionnaireEntity = await domainModel.getEntityByName(pluginInfo.config.schema.questionnaire);
            const questionnaireDocument = await questionnaireEntity.getDocuments(persistence, {_id: surveyId}, true);
            const feedbackRelationship = await questionnaireEntity.getRelationshipByName(pluginInfo.config.schema.surveyToolFeedback);
            const feedbackDocuments = await feedbackRelationship.getDocuments(persistence, questionnaireDocument[0]);

            const getFeedbackByThumbDirection = (thumbDirection, result, question) => {
                const filteredFeedback = _.filter(feedbackDocuments, (document) => {
                    const matchesThumbDirection = document.ThumbDirection === thumbDirection;
                    const matchesAssociations = document.associations && document.associations.length === 3 && document.associations[0].data[0]._id === result.id && document.associations[1].data[0]._id === typeHAL.id && document.associations[2].data[0]._id === question.id;

                    return matchesThumbDirection && matchesAssociations;
                });

                question.embed(thumbDirection, filteredFeedback.map((feedback) => {
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
                question[thumbDirection] = filteredFeedback.length;
            };

            const thumbResult = (thumbsUp, thumbsDown) => {
                let result = 'neutral';
                if (thumbsUp !== 0 || thumbsDown !== 0) {
                    if (thumbsUp - thumbsDown === 0) {
                        result = 'tie';
                    } else if (thumbsUp - thumbsDown > 0) {
                        result = 'positive';
                    } else {
                        result = 'negative';
                    }
                }

                return result;
            };

            _.each(typeHAL._embedded.results, (result) => {
                _.each(result._embedded.relevantQuestions, (question) => {
                    getFeedbackByThumbDirection('ThumbsUp', result, question);
                    getFeedbackByThumbDirection('ThumbsDown', result, question);
                    question.commentResult = thumbResult(parseInt(question.ThumbsUp, 10), parseInt(question.ThumbsDown, 10));
                });
            });

            resource.embed('items', typeHAL);
            await utils.sendHal(req, res, resource);
        } catch (err) {
            console.error("server/root/get-types: err:", err);
            await utils.sendErrorHal(req, res, resource, err);
        } finally {
            await pluginInfo.persistence.close();
        }
    }
});
