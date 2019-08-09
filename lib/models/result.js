const _ = require('lodash');

const Content = require('./content');
const getModelInstances = require('./get-model-instances');
const Question = require('./question');

class Result {
    constructor() {
        this.id = null;
        this.name = null;

        this.relevantHighs = [];
        this.relevantLows = [];
        this.contents = [];
    }

    fromPersistence(Promise, pluginInfo, entity, instance) {
        return Promise.resolve()
            .then(() => {
                this.id = instance.id;
                this.name = instance.Name;
            })

            // relevant if high
            .then(() => getModelInstances(
                Promise, pluginInfo, entity, instance, pluginInfo.config.schema.relevantHigh, Question
            ))
            .then((questions) => {
                this.relevantHighs = questions;
            })

            // relevant if low
            .then(() => getModelInstances(
                Promise, pluginInfo, entity, instance, pluginInfo.config.schema.relevantLow, Question
            ))
            .then((questions) => {
                this.relevantLows = questions;
            })

            // content
            .then(() => getModelInstances(
                Promise, pluginInfo, entity, instance, pluginInfo.config.schema.content, Content
            ))
            .then((contents) => {
                this.contents = contents;
            })

            .then(() => this)
        ;
    }

    toHal(warpjsUtils, RoutesInfo, routes, domain, surveyId, resultsetId) {
        const resource = warpjsUtils.createResource('', {
            id: this.id,
            name: this.name
        });

        let relevantQuestions = this.relevantHighs.map(
            (question) => {
                const questionHal = question.toHalRelevance(warpjsUtils, RoutesInfo, routes, domain, surveyId, resultsetId, this.id);
                questionHal.relevance = 'high';

                return questionHal;
            }
        );

        relevantQuestions = relevantQuestions.concat(this.relevantLows.map(
            (question) => {
                const questionHal = question.toHalRelevance(warpjsUtils, RoutesInfo, routes, domain, surveyId, resultsetId, this.id);
                questionHal.relevance = 'low';

                return questionHal;
            }
        ));

        resource.link('submitFeedback', RoutesInfo.expand(routes.resultFeedback, {
            domain
        }));

        resource.embed('relevantQuestions', _.orderBy(relevantQuestions, [ 'name' ], [ 'asc' ]));

        resource.embed('contents', this.contents.map(
            (content) => content.toHal(warpjsUtils, RoutesInfo, routes)
        ));

        resource.link('thumbsup', RoutesInfo.expand(routes.aggregatedFeedbackResultDetails, {
            domain,
            surveyId: surveyId,
            resultsetId: resultsetId,
            resultId: this.id,
            thumbDirection: 'ThumbsUp'
        }));
        resource.link('thumbsdown', RoutesInfo.expand(routes.aggregatedFeedbackResultDetails, {
            domain,
            surveyId: surveyId,
            resultsetId: resultsetId,
            resultId: this.id,
            thumbDirection: 'ThumbsDown'
        }));

        return resource;
    }

    static fromHal(json) {
        const instance = new Result();

        instance.id = json.id;
        instance.name = json.name;

        if (json._embedded) {
            if (json._embedded.relevantHighs) {
                instance.relevantHighs = json._embedded.relevantHighs.map(Question.fromHal);
            }

            if (json._embedded.relevantLows) {
                instance.relevantLows = json._embedded.relevantLows.map(Question.fromHal);
            }

            if (json._embedded.contents) {
                instance.contents = json._embedded.contents.map(Content.fromHal);
            }
        }

        return instance;
    }

    setQuestionFeedback(Promise, persistence, collection, data) {
        return Promise.resolve()
            .then(() => persistence.save(collection, data))
            .then((saveResult) => saveResult.id)
        ;
    }

    toHalResultFeedbackSpecific(warpjsUtils, RoutesInfo, routes, thumb) {
        const resource = warpjsUtils.createResource('', {
            id: this.id,
            name: this.name
        });

        return resource;
    }
}

module.exports = Result;
