class AnswerQuestion {
    constructor() {
        this.id = null;
        this.answer = null;
        this.comments = null;
        this.detailLevel = null; // FIXME: Remove this.
        this.questionModules = [];
    }

    toHal(warpjsUtils) {
        const resource = warpjsUtils.createResource('', {
            id: this.id,
            answer: this.answer,
            comments: this.comments,
            detailLevel: this.detailLevel, // FIXME: Remove this.
            questionModules: this.questionModules
        });

        return resource;
    }

    static fromHal(json) {
        const instance = new AnswerQuestion();
        instance.id = json.id;
        instance.answer = json.answer;
        instance.comments = json.comments;
        instance.detailLevel = json.detailLevel; // FIXME: Remove this.
        instance.questionModules = json.questionModules;
        return instance;
    }

    toJSON() {
        return {
            id: this.id,
            answer: this.answer,
            comments: this.comments,
            detailLevel: this.detailLevel, // FIXME: Remove this.
            questionModules: this.questionModules
        };
    }
}

module.exports = AnswerQuestion;
