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

    static fromHal(json) {
        const instance = new Overview();

        instance.id = json.id;
        instance.position = json.position;
        instance.content = json.content;
        instance.heading = json.heading;

        return instance;
    }
}

module.exports = Overview;
