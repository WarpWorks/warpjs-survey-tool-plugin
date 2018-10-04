class Overview {
    constructor() {
        this.id = null;
        this.heading = null;
        this.content = null;
        this.position = null;
    }

    fromPersistence(Promise, pluginInfo, entity, instance) {
        return Promise.resolve()
            .then(() => {
                this.id = instance.id;
                this.position = instance.Position;
                this.heading = instance.Heading;
                this.content = instance.Content;
            })
            .then(() => this)
        ;
    }

    toHal(warpjsUtils, RoutesInfo, routes) {
        const resource = warpjsUtils.createResource('', {
            id: this.id,
            position: this.position,
            content: this.content,
            heading: this.heading
        });

        return resource;
    }
}

module.exports = Overview;
