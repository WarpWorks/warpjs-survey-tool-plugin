const AnswerQuestion = require('./answer-question');
const getModelInstances = require('./get-model-instances');
const Imglib = require('./imglib');
const Option = require('./option');

function convertDetailLevel(level) {
    let newLevel = 3;
    if (level === 'Level_Zero') {
        newLevel = 1;
    } else if (level === 'Level_One') {
        newLevel = 2;
    }

    return newLevel;
}

class Question {
    constructor() {
        this.id = null;
        this.content = null;
        this.position = null;
        this.name = null;
        this.imageArea = null;
        this.detailLevel = null;

        // FIXME: Should be embedded.
        this.image = null;
        this.imageUrl = null;
        this.imgLibId = null;

        this.options = [];
    }

    fromPersistence(Promise, pluginInfo, entity, instance) {
        return Promise.resolve()
            .then(() => {
                this.id = instance.id;
                this.position = instance.Position;
                this.name = instance.Name;
                this.content = instance.Description;
                this.imageArea = instance.ImageArea;
                this.detailLevel = convertDetailLevel(instance.Level_of_Detail);
            })

            // Options
            .then(() => getModelInstances(
                Promise, pluginInfo, entity, instance, pluginInfo.config.schema.option, Option
            ))
            .then((options) => {
                this.options = options;
            })

            // ImageResource
            .then(() => getModelInstances(
                Promise, pluginInfo, entity, instance, pluginInfo.config.schema.image, Imglib
            ))
            .then((imgLibs) => {
                if (imgLibs && imgLibs.length) {
                    // console.log(`question.imgLibs[0]=`, imgLibs[0]);
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
            position: this.position,
            name: this.name,
            content: this.content,
            imageArea: this.imageArea,
            detailLevel: this.detailLevel,
            image: this.image,
            imageUrl: this.imageUrl,
            imgLibId: this.imgLibId
        });

        resource.embed('options', this.options.map(
            (option) => option.toHal(warpjsUtils, RoutesInfo, routes)
        ));

        return resource;
    }

    static fromHal(json) {
        const instance = new Question();

        instance.id = json.id;
        instance.position = json.position;
        instance.name = json.name;
        instance.content = json.content;
        instance.imageArea = json.imageArea;
        instance.detailLevel = json.detailLevel;
        instance.image = json.image;
        instance.imageUrl = json.imageUrl;
        instance.imgLibId = json.imgLibId;

        if (json._embedded) {
            if (json._embedded.options) {
                instance.options = json._embedded.options.map(Option.fromHal);
            }
        }

        return instance;
    }

    toHalRelevance(warpjsUtils, RoutesInfo, routes) {
        const resource = warpjsUtils.createResource('', {
            id: this.id,
            name: this.name,
            position: this.position,
            detailLevel: this.detailLevel
        });

        return resource;
    }

    generateDefaultAnswer(uuid) {
        const answerQuestion = new AnswerQuestion();
        answerQuestion.id = this.id;
        answerQuestion.detailLevel = this.detailLevel;

        return answerQuestion;
    }
}

module.exports = Question;
