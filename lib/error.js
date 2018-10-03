class SurveyToolError extends Error {
    constructor(message) {
        super(message);
        this.name = `WarpJS.${this.constructor.name}`;
    }
}

module.exports = SurveyToolError;
