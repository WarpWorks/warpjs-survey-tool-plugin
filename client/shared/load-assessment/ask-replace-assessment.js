const askGotoAssessment = require('./ask-goto-assessment');
const loadAssessmentPopup = require('./load-assessment-popup');
const storage = require('./../../storage');

module.exports = ($, placeholder, obj) => {
    const div = loadAssessmentPopup($, placeholder, "Assessment ID already defined.", [
        { btnClass: 'danger', action: 'load-replace', label: "Replace" },
        { btnClass: 'primary', action: 'load-clone', label: "Clone" },
        { btnClass: 'default', action: 'load-cancel', label: "Cancel" }
    ]);

    $('[data-survey-tool-action="load-cancel"]', div).on('click', function() {
        div.remove();
    });

    $('[data-survey-tool-action="load-clone"]', div).on('click', function() {
        const assessmentId = storage.createAssessment(obj.surveyId);
        obj.assessmentId = assessmentId;
        storage.updateAssessment(obj.surveyId, obj.assessmentId, obj);
        div.remove();
        askGotoAssessment($, placeholder, obj);
    });

    $('[data-survey-tool-action="load-replace"]', div).on('click', function() {
        storage.updateAssessment(obj.surveyId, obj.assessmentId, obj);
        div.remove();
        askGotoAssessment($, placeholder, obj);
    });
};
