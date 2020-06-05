const gotoAssessment = require('./goto-assessment');
const loadAssessmentPopup = require('./load-assessment-popup');
const storage = require('./../../storage');

module.exports = ($, placeholder, obj, stored) => {
    const div = loadAssessmentPopup($, placeholder, "Warning: A project with the same ID already exists in this browser (‘" + stored.projectName + "’)!", obj, [
        { btnClass: 'danger', action: 'load-replace', label: "Overwrite ‘" + stored.projectName + "’" },
        { btnClass: 'primary', action: 'load-clone', label: "Open ‘" + obj.projectName + "’ as a new project." },
        { btnClass: 'default', action: 'load-cancel', label: "Cancel" }
    ]);

    $('[data-survey-tool-action="load-cancel"]', div).on('click', function() {
        div.remove();
    });

    $('[data-survey-tool-action="load-clone"]', div).on('click', function() {
        const questionnaires = storage.getCurrent($, storage.KEYS.QUESTIONNAIRES);
        const questionnaire = questionnaires[obj.surveyId];
        const assessmentId = storage.createAssessment(obj.surveyId, questionnaire);
        obj.assessmentId = assessmentId;
        storage.updateAssessment(obj.surveyId, obj.assessmentId, obj);
        gotoAssessment($, placeholder, obj);
    });

    $('[data-survey-tool-action="load-replace"]', div).on('click', function() {
        storage.updateAssessment(obj.surveyId, obj.assessmentId, obj);
        div.remove();
        gotoAssessment($, placeholder, obj);
    });
};
