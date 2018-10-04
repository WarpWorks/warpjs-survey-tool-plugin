const AnswerIteration = require('./answer-iteration');

class AnswerCategory {
    constructor() {
        this.comments = null;
        this.isRepeatable = false;
        this.iterations = [];
    }

    static fromHal(json) {
        const instance = new this();
        instance.comments = json.comments;
        instance.isRepeatable = Boolean(json.isRepeatable);
        if (json._embedded && json._embedded.iterations) {
            instance.iterations = json._embedded.iterations.map((iterationJson) => AnswerIteration.fromHal(iterationJson));
        }
        return instance;
    }

    toJSON() {
        return {
            comments: this.comments,
            isRepeatable: this.isRepeatable,
            _embedded: {
                iterations: this.iterations.map((iteration) => iteration.toJSON())
            }
        };
    }
}

module.exports = AnswerCategory;
