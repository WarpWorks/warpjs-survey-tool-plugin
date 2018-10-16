// const askGotoAssessment = require('./ask-goto-assessment');
const askReplaceAssessment = require('./ask-replace-assessment');
const gotoAssessment = require('./goto-assessment');
const gotoError = require('./goto-error');
const storage = require('./../../storage');

module.exports = ($, placeholder, result) => {
    try {
        let obj = JSON.parse(result);
        const current = storage.getCurrent($);

        if (obj.id) {
            // Convert old format.
            obj.assessmentId = obj.id;
            delete obj.id;

            // Assume current survey to be default for old format.
            obj.surveyId = current.surveyId || current.surveyToolDefaultSurveyId;

            obj._meta = {history: [
                {
                    name: "",
                    revision: "1.0",
                    description: "",
                    timestamp: Date.now()
                }
            ]};
        }

        const stored = storage.getAssessment(obj.surveyId, obj.assessmentId);

        if (current.assessmentId) {
            // Survey in progress.
            if (stored) {
                askReplaceAssessment($, placeholder, obj, stored);
            } else {
                // Importing new assessmentId.
                storage.updateAssessment(obj.surveyId, obj.assessmentId, obj);
                // askGotoAssessment($, placeholder, obj);
                // FIXME: should show modal
                gotoAssessment($, placeholder, obj);
            }
        } else if (stored) {
            askReplaceAssessment($, placeholder, obj, stored);
        } else {
            storage.updateAssessment(obj.surveyId, obj.assessmentId, obj);
            gotoAssessment($, placeholder, obj);
        }
    } catch (error) {
        if (error instanceof SyntaxError) {
            gotoError($, placeholder, error, true);
        } else {
            gotoError($, placeholder, error, false);
        }
    }
};
