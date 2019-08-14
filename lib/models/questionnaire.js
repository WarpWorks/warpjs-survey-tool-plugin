const Answer = require('./answer');
const Assessment = require('./assessment');
const Category = require('./category');
const Email = require('./email');
const getModelInstances = require('./get-model-instances');
const Imglib = require('./imglib');
const Persona = require('./persona');
const ResultFeedback = require('./result-feedback');
const ResultSet = require('./result-set');

class Questionnaire {
    constructor() {
        this.id = null;
        this.name = null;
        this.categories = [];
        this.images = [];
        this.resultSets = [];
        this.key = null;
        this.personas = [];
    }

    fromPersistence(Promise, pluginInfo, entity, instance) {
        return Promise.resolve()
            .then(() => {
                this.id = instance.id;
                this.name = instance.Name;
                this.key = instance.Key;
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

            // Personas
            .then(() => getModelInstances(
                Promise, pluginInfo, entity, instance, pluginInfo.config.schema.persona, Persona
            ))
            .then((personas) => {
                this.personas = personas;
            })

            .then(() => this)
        ;
    }

    toHal(warpjsUtils, RoutesInfo, routes, domain) {
        const url = RoutesInfo.expand(routes.assessment, {domain, surveyId: this.id});
        const resource = warpjsUtils.createResource(url, {
            id: this.id,
            name: this.name,
            key: this.key
        });
        resource.embed('categories', this.categories.map(
            (category) => category.toHal(warpjsUtils, RoutesInfo, routes, domain)
        ));

        resource.embed('imageLibraries', this.images.map(
            (image) => image.toHal(warpjsUtils)
        ));

        resource.embed('resultSets', this.resultSets.map(
            (resultSet) => resultSet.toHal(warpjsUtils, RoutesInfo, routes, domain, this.id)
        ));

        resource.embed('personas', this.personas.map(
            (persona) => persona.toHal(warpjsUtils, RoutesInfo, routes, domain, this.id)
        ));

        return resource;
    }

    static fromHal(json) {
        const instance = new Questionnaire();
        instance.id = json.id;
        instance.name = json.name;
        instance.key = json.key;

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

            if (json._embedded.personas) {
                instance.personas = json._embedded.resultSets.map(Persona.fromHal);
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

    generateDefaultAssessment(uuid, assessmentId) {
        const assessment = new Assessment(assessmentId);
        assessment.surveyId = this.id;
        assessment.projectName = this.key === 'ipt' ? 'New Project' : (this.key === 'mm' ? 'New Analysis' : null);
        assessment.answers = [ this.generateDefaultAnswer(uuid) ];
        assessment.resultsetFeedback = [];

        return assessment;
    }

    newResultFeedback(feedbackId, thumbValue, comment, feedbackType, basedOn, questionSpecific) {
        const resultQuestionFeedback = new ResultFeedback(feedbackId);
        resultQuestionFeedback.comment = comment;
        resultQuestionFeedback.thumbDirection = thumbValue;
        resultQuestionFeedback.createdDate = (new Date()).toISOString();
        resultQuestionFeedback.feedbackType = feedbackType;
        resultQuestionFeedback.basedOn = basedOn;
        resultQuestionFeedback.questionSpecific = questionSpecific;

        return resultQuestionFeedback;
    }

    newEmail(emailId, fullName, email) {
        const emailSubmit = new Email(emailId);
        emailSubmit.fullName = fullName;
        emailSubmit.email = email;

        return emailSubmit;
    }
}

module.exports = Questionnaire;
