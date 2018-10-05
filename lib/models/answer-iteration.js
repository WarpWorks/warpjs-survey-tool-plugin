const AnswerQuestion = require('./answer-question');

class AnswerIteration {
    constructor() {
        this.id = null;
        this.name = null;
        this.questions = [];
    }

    toHal(warpjsUtils) {
        const resource = warpjsUtils.createResource('', {
            id: this.id,
            name: this.name
        });

        resource.embed('questions', this.questions.map((question) => question.toHal(warpjsUtils)));

        return resource;
    }

    static fromHal(json) {
        const instance = new AnswerIteration();
        instance.id = json.id;
        instance.name = json.name;
        if (json._embedded && json._embedded.questions) {
            instance.questions = json._embedded.questions.map((questionJson) => AnswerQuestion.fromHal(questionJson));
        }
        return instance;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            _embedded: {
                questions: this.questions.map((question) => question.toJSON())
            }
        };
    }

    addQuestion(question) {
        this.questions.push(question);
    }
}

module.exports = AnswerIteration;
