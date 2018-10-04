class AnswerQuestion {
    constructor() {
        this.id = null;
        this.answer = null;
        this.comments = null;
        this.detailLevel = null; // FIXME: Remove this.
    }

    static fromHal(json) {
        const instance = new this();
        instance.id = json.id;
        instance.answer = json.answer;
        instance.comments = json.comments;
        instance.detailLevel = json.detailLevel; // FIXME: Remove this.
        return instance;
    }

    toJSON() {
        return {
            id: this.id,
            answer: this.answer,
            comments: this.comments,
            detailLevel: this.detailLevel // FIXME: Remove this.
        };
    }
}

module.exports = AnswerQuestion;
