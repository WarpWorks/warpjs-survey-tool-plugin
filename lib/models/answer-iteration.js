const AnswerQuestion = require('./answer-question');

class AnswerIteration {
    constructor() {
        this.id = null;
        this.name = null;
        this.questions = [];
    }

    static fromHal(json) {
        const instance = new this();
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
}

module.exports = AnswerIteration;
