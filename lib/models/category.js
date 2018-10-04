const getModelInstances = require('./get-model-instances');
const Imglib = require('./imglib');
const Question = require('./question');

class Category {
    constructor(entity, instance) {
        this.id = null;
        this.name = null;
        this.content = null;
        this.position = null;
        this.isRepeatable = false;
        this.imageArea = null;
        this.questions = [];

        // FIXME: Should be embedded.
        this.image = null;
        this.imageUrl = null;
        this.imgLibId = null;
    }

    fromPersistence(Promise, pluginInfo, entity, instance) {
        return Promise.resolve()
            .then(() => {
                this.id = instance.id;
                this.name = instance.Name;
                this.content = instance.Description;
                this.position = instance.Position;
                this.isRepeatable = Boolean(instance.isRepeatable);
                this.imageArea = instance.ImageArea;
            })

            // Questions
            .then(() => getModelInstances(
                Promise, pluginInfo, entity, instance, pluginInfo.config.schema.question, Question
            ))
            .then((questions) => {
                this.questions = questions;
            })

            // ImageResource
            .then(() => getModelInstances(
                Promise, pluginInfo, entity, instance, pluginInfo.config.schema.image, Imglib
            ))
            .then((imgLibs) => {
                if (imgLibs && imgLibs.length) {
                    // console.log(`category.imgLibs[0]=`, imgLibs[0]);
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

    toHal(warpjsUtils, RoutesInfo, routes) {
        const resource = warpjsUtils.createResource('', {
            id: this.id,
            name: this.name,
            content: this.content,
            position: this.position,
            isRepeatable: this.isRepeatable,
            imageArea: this.imageArea,

            // FIXME: Should be embedded.
            image: this.image,
            imageUrl: this.imageUrl,
            imgLibId: this.imgLibId
        });

        resource.embed('questions', this.questions.map(
            (question) => question.toHal(warpjsUtils, RoutesInfo, routes)
        ));

        return resource;
    }
}

module.exports = Category;
