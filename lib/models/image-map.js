class ImageMap {
    constructor() {
        this.id = null;
        this.coords = null;
        this.title = null;
    }

    fromPersistence(Promise, pluginInfo, entity, instance) {
        return Promise.resolve()
            .then(() => {
                // console.log("imageMap.fromPersistence(): instance=", instance);
                this.id = instance.id || instance._id;
                this.coords = instance.Coords;
                this.title = instance.Title;
            })
            .then(() => this)
        ;
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
