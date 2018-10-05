const getModelInstances = require('./get-model-instances');
const Image = require('./image');

class Imglib {
    constructor() {
        this.id = null;
        this.name = null;
        this.content = null;

        this.images = [];
    }

    fromPersistence(Promise, pluginInfo, entity, instance) {
        return Promise.resolve()
            .then(() => {
                // console.log("imglib.fromPersistence(): instance=", instance);
                this.id = instance.id;
                this.name = instance.Name;
                this.content = instance.Description;
            })

            .then(() => getModelInstances(
                Promise, pluginInfo, entity, instance, pluginInfo.config.schema.image, Image
            ))
            .then((images) => {
                this.images = images;
            })
            .then(() => this)
        ;
    }

    toHal(warpjsUtils, RoutesInfo, routes) {
        const resource = warpjsUtils.createResource('', {
            id: this.id,
            name: this.name,
            content: this.content
        });

        resource.embed('images', this.images.map(
            (image) => image.toHal(warpjsUtils, RoutesInfo, routes)
        ));

        return resource;
    }

    static fromHal(json) {
        const instance = new Imglib();

        instance.id = json.id;
        instance.name = json.name;
        instance.content = json.content;

        if (json._embedded) {
            if (json._embedded.images) {
                instance.images = json._embedded.images.map(Image.fromHal);
            }
        }

        return instance;
    }
}

module.exports = Imglib;
