const AnswerIteration = require('./answer-iteration');

class AnswerCategory {
    constructor() {
        this.id = null;
        this.comments = null;
        this.isRepeatable = false;
        this.iterations = [];
    }

    toHal(warpjsUtils) {
        const resource = warpjsUtils.createResource('', {
            id: this.id,
            comments: this.comments,
            isRepeatable: this.isRepeatable
        });

        resource.embed('iterations', this.iterations.map((iteration) => iteration.toHal(warpjsUtils)));

        return resource;
    }

    static fromHal(json) {
        const instance = new AnswerCategory();
        instance.id = json.id;
        instance.comments = json.comments;
        instance.isRepeatable = Boolean(json.isRepeatable);
        if (json._embedded && json._embedded.iterations) {
            instance.iterations = json._embedded.iterations.map((iterationJson) => AnswerIteration.fromHal(iterationJson));
        }
        return instance;
    }

    toJSON() {
        return {
            id: this.id,
            comments: this.comments,
            isRepeatable: this.isRepeatable,
            _embedded: {
                iterations: this.iterations.map((iteration) => iteration.toJSON())
            }
        };
    }

    addIteration(iteration) {
        this.iterations.push(iteration);
    }
}

module.exports = AnswerCategory;
