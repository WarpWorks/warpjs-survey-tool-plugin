const _ = require('lodash');

const Content = require('./content');
const getModelInstances = require('./get-model-instances');
const Question = require('./question');

class ResultFeedback {
    constructor(resultFeedbackId) {
        this.id = resultFeedbackId;
        this.comment = null;
        this.thumbDirection = null;
        this.createdDate = null;
        this.feedbackType = null;
        this.basedOn = null;
        this.questionSpecific = null;
    }

    toPersistenceJSON() {
        return {
            type: 'SurveyToolFeedback',
            FeedbackType: this.feedbackType,
            name: '',
            Comment: this.comment,
            ThumbDirection: this.thumbDirection,
            CreatedDate: this.createdDate,
            embedded: [],
            associations: this.associations,
            BasedOn: this.basedOn,
            QuestionSpecific: this.questionSpecific
        };
    }

    save(Promise, persistence, parentID) {
        return Promise.resolve()
            .then(() => this.toPersistenceJSON())
            .then((json) => _.extend({}, json, {
                parentID,
                lastUpdated: (new Date()).toISOString()
            }))
            .then((json) => persistence.save(json.type, json))
            .then((saveResult) => saveResult.id)
        ;
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

    toHal(warpjsUtils, RoutesInfo, routes, domain, resultsetId) {
        const resource = warpjsUtils.createResource('', {
            id: this.id,
            name: this.name
        });

        let relevantQuestions = this.relevantHighs.map(
            (question) => {
                const questionHal = question.toHalRelevance(warpjsUtils, RoutesInfo, routes, domain, resultsetId, this.id);
                questionHal.relevance = 'high';

                return questionHal;
            }
        );

        relevantQuestions = relevantQuestions.concat(this.relevantLows.map(
            (question) => {
                const questionHal = question.toHalRelevance(warpjsUtils, RoutesInfo, routes, domain, resultsetId, this.id);
                questionHal.relevance = 'low';

                return questionHal;
            }
        ));

        resource.embed('relevantQuestions', _.orderBy(relevantQuestions, [ 'name' ], [ 'asc' ]));

        resource.embed('contents', this.contents.map(
            (content) => content.toHal(warpjsUtils, RoutesInfo, routes)
        ));

        return resource;
    }

    static fromHal(json) {
        const instance = new ResultFeedback();

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
}

module.exports = ResultFeedback;
