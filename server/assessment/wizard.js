// const debug = require('debug')('W2:plugin:survey-tool:assessment/wizard');
const _ = require('lodash');
const RoutesInfo = require('@quoin/expressjs-routes-info');
const uuid = require('uuid');
const warpjsUtils = require('@warp-works/warpjs-utils');

const constants = require('./../../lib/constants');
const Questionnaire = require('./../../lib/models/questionnaire');
const utils = require('./../utils');

module.exports = (req, res) => warpjsUtils.wrapWith406(res, {
    html: () => {
        warpjsUtils.sendIndex(req, res, RoutesInfo, 'Ipt',
            [
                `${req.app.get('base-url')}/assets/${constants.assets.assessment}`
            ],
            `${req.app.get('base-url')}/assets/${constants.assets.css}`
        );
    },

    [warpjsUtils.constants.HAL_CONTENT_TYPE]: async () => {
        const { surveyId, assessmentId } = req.params;
        const pluginInfo = utils.getPluginInfo(req);

        const resource = warpjsUtils.createResource(req, {
            domain: pluginInfo.domain,
            surveyId,
            assessmentId
        });

        try {
            const domainModel = await pluginInfo.warpCore.getDomainByName(pluginInfo.domain);
            const questionnaireEntity = domainModel.getEntityByName(pluginInfo.config.schema.questionnaire);
            const instance = await questionnaireEntity.getInstance(pluginInfo.persistence, surveyId);
            if (!instance.id) {
                throw new Error(`Cannot find Survey Tool id: ${surveyId}`);
            }
            const questionnaire = new Questionnaire(questionnaireEntity, instance);
            const hal = await questionnaire.toHalFull(pluginInfo.domain, pluginInfo.config, pluginInfo.persistence);
            resource.embed('questionnaires', hal);

            // create answers resource
            const answersResource = warpjsUtils.createResource(req, {
                id: resource._embedded.questionnaires[0].id
            });
            const questionnaires = resource && resource._embedded ? resource._embedded.questionnaires : null;
            const answerQuestionnaire = questionnaires ? questionnaires[0] : null;
            const categories = answerQuestionnaire && answerQuestionnaire._embedded ? answerQuestionnaire._embedded.categories : null;
            const answersCategories = _.map(categories, (category) => {
                const categoryResource = warpjsUtils.createResource(req, {
                    id: category.id,
                    isRepeatable: category.isRepeatable,
                    comments: ''
                });
                const answerIterationsEmpty = category.isRepeatable ? new Array(6) : new Array(1);
                const answerIterations = _.map(answerIterationsEmpty, () => {
                    const iterationResource = warpjsUtils.createResource('', {
                        id: uuid(),
                        name: ''
                    });
                    const answerQuestions = _.map(category._embedded.questions, (question) => {
                        return warpjsUtils.createResource('', {
                            id: question.id,
                            detailLevel: question.detailLevel,
                            answer: '',
                            comments: ''
                        });
                    });

                    return iterationResource.embed('questions', answerQuestions);
                });

                return categoryResource.embed('iterations', answerIterations);
            });
            const answersHAL = answersResource.embed('categories', answersCategories);
            resource.embed('answers', answersHAL);

            await utils.sendHal(req, res, resource);
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error("server/assessment/wizard: err:", err);
            await utils.sendErrorHal(req, res, resource, err);
        } finally {
            await pluginInfo.persistence.close();
        }
    }
});
