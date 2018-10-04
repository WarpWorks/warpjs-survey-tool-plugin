const AnswerCategory = require('./answer-category');

class Answer {
    constructor() {
        this.categories = [];
    }

    static fromHal(json) {
        const instance = new this();

        if (json._embedded && json._embedded.categories) {
            instance.categories = json._embedded.categories.map((categoryJson) => AnswerCategory.fromHal(categoryJson));
        }
        return instance;
    }

    toJSON() {
        return {
            _embedded: {
                categories: this.categories.map((category) => category.toJSON())
            }
        };
    }

    toHal(warpjsUtils) {
        const resource = warpjsUtils.createResource('', {
        });

        return resource;
    }
}

module.exports = Answer;
