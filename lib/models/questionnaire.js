const Answer = require('./answer');
const Category = require('./category');
const getModelInstances = require('./get-model-instances');
const Imglib = require('./imglib');
const ResultSet = require('./result-set');

class Questionnaire {
    constructor() {
        this.id = null;
        this.name = null;
        this.categories = [];
        this.images = [];
        this.resultSets = [];
    }

    fromPersistence(Promise, pluginInfo, entity, instance) {
        return Promise.resolve()
            .then(() => {
                this.id = instance.id;
                this.name = instance.Name;
            })

            // Categories
            .then(() => getModelInstances(
                Promise, pluginInfo, entity, instance, pluginInfo.config.schema.category, Category
            ))
            .then((categories) => {
                this.categories = categories;
            })

            // Images
            .then(() => getModelInstances(
                Promise, pluginInfo, entity, instance, pluginInfo.config.schema.imageLibrary, Imglib
            ))
            .then((images) => {
                this.images = images;
            })

            // ResultSets
            .then(() => getModelInstances(
                Promise, pluginInfo, entity, instance, pluginInfo.config.schema.resultSet, ResultSet
            ))
            .then((resultSets) => {
                this.resultSets = resultSets;
            })

            .then(() => this)
        ;
    }

    toBaseHal(warpjsUtils, RoutesInfo, routes) {
        const href = RoutesInfo.expand(routes.assessment, { surveyId: this.id });
        const resource = warpjsUtils.createResource(href, {
            id: this.id,
            name: this.name
        });

        return resource;
    }

    toHal(warpjsUtils, RoutesInfo, routes) {
        const resource = this.toBaseHal(warpjsUtils, RoutesInfo, routes);

        resource.embed('categories', this.categories.map(
            (category) => category.toHal(warpjsUtils, RoutesInfo, routes)
        ));

        resource.embed('imageLibraries', this.images.map(
            (image) => image.toHal(warpjsUtils, RoutesInfo, routes)
        ));

        resource.embed('resultSets', this.resultSets.map(
            (resultSet) => resultSet.toHal(warpjsUtils, RoutesInfo, routes)
        ));

        resource.link('docx', RoutesInfo.expand(routes.docx, {}));

        return resource;
    }

    static fromHal(json) {
        const instance = new Questionnaire();
        instance.id = json.id;
        instance.name = json.name;

        if (json._embedded) {
            if (json._embedded.categories) {
                instance.categories = json._embedded.categories.map(Category.fromHal);
            }

            if (json._embedded.imageLibraries) {
                instance.images = json._embedded.imageLibraries.map(Imglib.fromHal);
            }

            if (json._embedded.resultSets) {
                instance.resultSets = json._embedded.resultSets.map(ResultSet.fromHal);
            }
        }

        return instance;
    }

    generateDefaultAnswer(uuid) {
        const answer = new Answer();
        answer.id = this.id;

        this.categories.forEach((category) => answer.addCategory(category.generateDefaultAnswer(uuid)));

        return answer;
    }
}

module.exports = Questionnaire;
