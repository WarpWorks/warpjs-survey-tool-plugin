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

    toHal(warpjsUtils, RoutesInfo, routes) {
        const resource = warpjsUtils.createResource('', {
            id: this.id,
            name: this.name
        });

        resource.embed('relevantHighs', this.relevantHighs.map(
            (question) => question.toHalRelevance(warpjsUtils, RoutesInfo, routes)
        ));

        resource.embed('relevantLows', this.relevantLows.map(
            (question) => question.toHalRelevance(warpjsUtils, RoutesInfo, routes)
        ));

        resource.embed('contents', this.contents.map(
            (content) => content.toHal(warpjsUtils, RoutesInfo, routes)
        ));

        return resource;
    }
}

module.exports = Result;
