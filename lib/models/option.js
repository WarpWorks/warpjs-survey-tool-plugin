class Option {
    constructor() {
        this.id = null;
        this.name = null;
        this.content = null;
        this.position = null;
    }

    fromPersistence(Promise, pluginInfo, entity, instance) {
        return Promise.resolve()
            .then(() => {
                this.id = instance.id;
                this.position = instance.Position;
                this.name = instance.Name;
                this.content = instance.Description;
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

        return resource;
    }

    static fromHal(json) {
        const instance = new Option();

        instance.id = json.id;
        instance.position = json.position;
        instance.name = json.name;
        instance.content = json.content;

        return instance;
    }
}

module.exports = Option;
