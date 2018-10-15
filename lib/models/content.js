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
                this.instance = instance;
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
        const href = RoutesInfo.expand('entity', {type: this.instance.type, id: this.instance.id});
        const resource = warpjsUtils.createResource(href, {
            id: this.id,
            name: this.name
        });

        resource.embed('overviews', this.overviews.map(
            (overview) => overview.toHal(warpjsUtils, RoutesInfo, routes)
        ));

        return resource;
    }

    static fromHal(json) {
        const instance = new Content();

        instance.id = json.id;
        instance.name = json.name;

        if (json._embedded) {
            if (json._embedded.overviews) {
                instance.overviews = json._embedded.overviews.map(Overview.fromHal);
            }
        }
        return instance;
    }
}

module.exports = Content;
