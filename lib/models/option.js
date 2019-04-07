class Option {
    constructor() {
        this.id = null;
        this.name = null;
        this.content = null;
        this.position = null;
        this.currentStatus = null;
        this.nextLevel = null;
    }

    async fromPersistence(Promise, pluginInfo, entity, instance) {
        this.id = instance.id;
        this.position = instance.Position;
        this.name = instance.Name;
        this.content = instance.Description;
        this.currentStatus = instance.CurrentStatus;
        this.nextLevel = instance.NextLevel;

        return this;
    }

    toHal(warpjsUtils, RoutesInfo, routes) {
        const resource = warpjsUtils.createResource('', {
            id: this.id,
            position: this.position,
            name: this.name,
            content: this.content,
            currentStatus: this.currentStatus,
            nextLevel: this.nextLevel
        });

        return resource;
    }

    static fromHal(json) {
        const instance = new Option();

        instance.id = json.id;
        instance.position = json.position;
        instance.name = json.name;
        instance.content = json.content;
        instance.currentStatus = json.currentStatus;
        instance.nextLevel = json.nextLevel;

        return instance;
    }
}

module.exports = Option;
