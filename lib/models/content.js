const getModelInstances = require('./get-model-instances');
const Overview = require('./overview');

class Content {
    constructor() {
        this.id = null;
        this.name = null;

        this.overviews = [];
    }

    fromPersistence(Promise, pluginInfo, entity, instance) {
        return Promise.resolve()
            .then(() => {
                this.id = instance.id;
                this.name = instance.Name;
            })

            .then(() => getModelInstances(
                Promise, pluginInfo, entity, instance, 'Overview', Overview
            ))
            .then((overviews) => {
                this.overviews = overviews;
            })

            .then(() => this)
        ;
    }

    toHal(warpjsUtils, RoutesInfo, routes) {
        const resource = warpjsUtils.createResource('', {
            id: this.id,
            name: this.name
        });

        resource.embed('overviews', this.overviews.map(
            (overview) => overview.toHal(warpjsUtils, RoutesInfo, routes)
        ));

        return resource;
    }
}

module.exports = Content;
