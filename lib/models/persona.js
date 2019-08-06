const _ = require('lodash');

const getModelInstances = require('./get-model-instances');
const Imglib = require('./imglib');

class Persona {
    constructor(personaId) {
        this.id = personaId;
        this.name = null;
        this.image = null;
        this.imageUrl = null;
        this.position = null;
    }

    save(Promise, persistence, parentID) {
        return Promise.resolve()
            .then(() => this.toPersistenceJSON())
            .then((json) => _.extend({}, json, {
                parentID,
                lastUpdated: (new Date()).toISOString()
            }))
            .then((json) => persistence.save(json.type, json))
            .then((saveResult) => saveResult.id)
        ;
    }

    fromPersistence(Promise, pluginInfo, entity, instance) {
        return Promise.resolve()
            .then(() => {
                this.id = instance.id;
                this.name = instance.Name;
                this.image = instance.image;
                this.imageUrl = instance.imageUrl;
                this.position = instance.Position;
            })
            // ImageResource
            .then(() => getModelInstances(
                Promise, pluginInfo, entity, instance, pluginInfo.config.schema.imageLibrary, Imglib
            ))
            .then((imgLibs) => {
                if (imgLibs && imgLibs.length) {
                    // FIXME: Should be embedded.
                    const imgLib = imgLibs[0];

                    this.imgLibId = imgLib.id;

                    if (imgLib.images && imgLib.images.length) {
                        const image = imgLib.images[0];

                        this.image = image.id;
                        this.imageUrl = image.url;
                    }
                }
            })
            .then(() => this)
        ;
    }

    toHal(warpjsUtils) {
        const resource = warpjsUtils.createResource('', {
            id: this.id,
            name: this.name,
            image: this.image,
            imageUrl: this.imageUrl,
            position: this.position
        });

        return resource;
    }

    static fromHal(json) {
        const instance = new Persona();

        instance.id = json.id;
        instance.name = json.name;
        instance.image = json.image;
        instance.imageUrl = json.imageUrl;
        instance.position = json.position;

        return instance;
    }
}

module.exports = Persona;
