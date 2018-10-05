const getModelInstances = require('./get-model-instances');
const Result = require('./result');

class ResultSet {
    constructor() {
        this.id = null;
        this.name = null;
        this.position = null;
        this.content = null;

        this.results = [];
    }

    fromPersistence(Promise, pluginInfo, entity, instance) {
        return Promise.resolve()
            .then(() => {
                this.id = instance.id;
                this.position = instance.Position;
                this.name = instance.Name;
                this.content = instance.Description;
            })

            .then(() => getModelInstances(
                Promise, pluginInfo, entity, instance, pluginInfo.config.schema.result, Result
            ))
            .then((results) => {
                this.results = results;
            })

            .then(() => this)
        ;
    }

    toHal(warpjsUtils, RoutesInfo, routes) {
        const resource = warpjsUtils.createResource('', {
            id: this.id,
            position: this.position,
            name: this.name,
            content: this.content
        });

        resource.embed('results', this.results.map(
            (result) => result.toHal(warpjsUtils, RoutesInfo, routes)
        ));

        return resource;
    }

    static fromHal(json) {
        const instance = new ResultSet();

        instance.id = json.id;
        instance.position = json.position;
        instance.name = json.name;
        instance.content = json.content;

        if (json._embedded) {
            if (json._embedded.results) {
                instance.results = json._embedded.results.map(Result.fromHal);
            }
        }

        return instance;
    }
}

module.exports = ResultSet;
