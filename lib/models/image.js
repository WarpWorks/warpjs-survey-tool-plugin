const getModelInstances = require('./get-model-instances');
const ImageMap = require('./image-map');

class Image {
    constructor() {
        this.id = null;
        this.url = null;
        this.height = null;
        this.width = null;

        this.imageMaps = [];
    }

    async fromPersistence(Promise, pluginInfo, entity, instance) {
        // console.log("image: instance=", instance);
        // console.log("image.fromPersistence(): entity.name=", entity.name);
        this.id = instance._id;
        this.url = instance.ImageURL;
        this.height = instance.Height;
        this.width = instance.Width;

        this.imageMaps = await getModelInstances(
            Promise, pluginInfo, entity, instance, pluginInfo.config.schema.map, ImageMap
        );

        return this;
    }

    toHal(warpjsUtils, RoutesInfo, routes) {
        const resource = warpjsUtils.createResource('', {
            id: this.id,
            url: this.url,
            height: this.height,
            width: this.width
        });

        resource.embed('imageMaps', this.imageMaps.map(
            (imageMap) => imageMap.toHal(warpjsUtils, RoutesInfo, routes)
        ));

        return resource;
    }

    static fromHal(json) {
        const instance = new Image();

        instance.id = json.id;
        instance.url = json.url;
        instance.height = json.height;
        instance.width = json.width;

        if (json._embedded) {
            if (json._embedded.imageMaps) {
                instance.imageMaps = json._embedded.imageMaps.map(ImageMap.fromHal);
            }
        }

        return instance;
    }
}

module.exports = Image;
