const AnswerCategory = require('./answer-category');
const AnswerIteration = require('./answer-iteration');
const getModelInstances = require('./get-model-instances');
const Imglib = require('./imglib');
const Persona = require('./persona');
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
        this.shortenedName = null;
        this.personas = [];

        // FIXME: Should be embedded.
        this.image = null;
        this.imageUrl = null;
        this.imgLibId = null;
        this.description = null;
        this.section = null;
        this.moduleDetailsName = null;
        this.moduleDetailsContent = null;
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
                this.shortenedName = instance.ShortenedName ? instance.ShortenedName : instance.Name;
                this.description = instance.Description;
                this.section = instance.Section;
                this.moduleDetailsName = instance.ModuleDetailsName;
                this.moduleDetailsContent = instance.ModuleDetailsContent;
            })

            // Questions
            .then(() => getModelInstances(
                Promise, pluginInfo, entity, instance, pluginInfo.config.schema.question, Question
            ))
            .then((questions) => {
                this.questions = questions;
            })

            // Persona
            .then(() => getModelInstances(
                Promise, pluginInfo, entity, instance, pluginInfo.config.schema.persona, Persona
            ))
            .then((personas) => {
                this.personas = personas;
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

    toHal(warpjsUtils, RoutesInfo, routes, domain) {
        const resource = warpjsUtils.createResource('', {
            id: this.id,
            name: this.name,
            content: this.content,
            position: this.position,
            isRepeatable: Boolean(this.isRepeatable),
            imageArea: this.imageArea,
            shortenedName: this.shortenedName,
            description: this.description,
            section: this.section,
            moduleDetailsName: this.moduleDetailsName,
            moduleDetailsContent: this.moduleDetailsContent,

            // FIXME: Should be embedded.
            image: this.image,
            imageUrl: this.imageUrl,
            imgLibId: this.imgLibId
        });

        resource.embed('questions', this.questions.map(
            (question) => question.toHal(warpjsUtils, RoutesInfo, routes, domain)
        ));

        resource.embed('personas', this.personas.map(
            (persona) => persona.toHal(warpjsUtils, RoutesInfo, routes)
        ));

        return resource;
    }

    static fromHal(json) {
        const instance = new Category();

        instance.id = json.id;
        instance.name = json.name;
        instance.content = json.content;
        instance.position = json.position;
        instance.isRepeatable = Boolean(json.isRepeatable);
        instance.imageArea = json.imageArea;
        instance.description = json.description;
        instance.section = json.section;
        instance.moduleDetailsName = json.moduleDetailsName;
        instance.moduleDetailsContent = json.moduleDetailsContent;

        instance.image = json.image;
        instance.imageUrl = json.imageUrl;
        instance.imgLibId = json.imgLibId;

        if (json._embedded) {
            if (json._embedded.questions) {
                instance.questions = json._embedded.questions.map(Question.fromHal);
            }

            if (json._embedded.personas) {
                instance.personas = json._embedded.personas.map(Persona.fromHal);
            }
        }

        return instance;
    }

    generateDefaultAnswer(uuid) {
        const answerCategory = new AnswerCategory();
        answerCategory.id = this.id;
        answerCategory.isRepeatable = this.isRepeatable;

        const iterations = this.isRepeatable ? 6 : 1;
        for (let i = 0; i < iterations; i++) {
            const answerIteration = new AnswerIteration();
            answerIteration.id = uuid();

            this.questions.forEach((question) => answerIteration.addQuestion(question.generateDefaultAnswer(uuid)));

            answerCategory.addIteration(answerIteration);
        }

        return answerCategory;
    }
}

module.exports = Category;
