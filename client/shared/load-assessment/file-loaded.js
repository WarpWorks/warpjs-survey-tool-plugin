const askGotoAssessment = require('./ask-goto-assessment');
const askReplaceAssessment = require('./ask-replace-assessment');
const gotoAssessment = require('./goto-assessment');
const storage = require('./../../storage');

module.exports = ($, placeholder, event) => {
    const obj = JSON.parse(event.target.result);

    const current = storage.getCurrent($);

    if (obj.id) {
        // Convert old format.
        obj.assessmentId = obj.id;
        delete obj.id;

        // Assume current survey to be default for old format.
        obj.surveyId = current.surveyId || current.surveyToolDefaultSurveyId;

        obj.data = {
            answers: obj.answers,
            detailLevel: obj.detailLevel,
            mainContact: obj.mainContact,
            projectName: obj.projectName,
            projectStatus: obj.projectStatus,
            solutionCanvas: obj.solutionCanvas
        };

        delete obj.answers;
        delete obj.detailLevel;
        delete obj.mainContact;
        delete obj.projectName;
        delete obj.projectStatus;
        delete obj.solutionCanvas;
    }

    const stored = storage.getAssessment(obj.surveyId, obj.assessmentId);

    if (current.assessmentId) {
        // Survey in progress.
        if (stored) {
            askReplaceAssessment($, placeholder, obj);
        } else {
            // Importing new assessmentId.
            storage.updateAssessment(obj.surveyId, obj.assessmentId, obj);
            askGotoAssessment($, placeholder, obj);
        }
    } else if (stored) {
        askReplaceAssessment($, placeholder, obj);
    } else {
        storage.updateAssessment(obj.surveyId, obj.assessmentId, obj);
        gotoAssessment($, placeholder, obj);
    }
};
