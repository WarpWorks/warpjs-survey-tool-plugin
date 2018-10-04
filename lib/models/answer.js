const AnswerCategory = require('./answer-category');

class Answer {
    constructor() {
        this.id = null;

        this.categories = [];
    }

    toHal(warpjsUtils) {
        const resource = warpjsUtils.createResource('', {
            id: this.id
        });

        resource.embed('categories', this.categories.map((category) => category.toHal(warpjsUtils)));

        return resource;
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

    addCategory(category) {
        this.categories.push(category);
    }
}

module.exports = Answer;
