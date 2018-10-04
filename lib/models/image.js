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

    fromPersistence(Promise, pluginInfo, entity, instance) {
        return Promise.resolve()
            .then(() => {
                // console.log("image: instance=", instance);
                // console.log("image.fromPersistence(): entity.name=", entity.name);
                this.id = instance._id;
                this.url = instance.ImageURL;
                this.height = instance.Height;
                this.width = instance.Width;
            })

            .then(() => getModelInstances(
                Promise, pluginInfo, entity, instance, pluginInfo.config.schema.map, ImageMap
            ))
            .then((imageMaps) => {
                this.imageMaps = imageMaps;
            })
            .then(() => this)
        ;
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
}

module.exports = Image;
