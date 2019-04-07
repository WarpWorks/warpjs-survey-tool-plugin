class ImageMap {
    constructor() {
        this.id = null;
        this.coords = null;
        this.title = null;
    }

    async fromPersistence(Promise, pluginInfo, entity, instance) {
        // console.log("imageMap.fromPersistence(): instance=", instance);
        this.id = instance.id || instance._id;
        this.coords = instance.Coords;
        this.title = instance.Title;

        return this;
    }

    toHal(warpjsUtils, RoutesInfo, routes) {
        const resource = warpjsUtils.createResource('', {
            id: this.id,
            coords: this.coords,
            title: this.title
        });

        return resource;
    }

    static fromHal(json) {
        const instance = new ImageMap();

        instance.id = json.id;
        instance.coords = json.coords;
        instance.title = json.title;

        return instance;
    }
}

module.exports = ImageMap;
