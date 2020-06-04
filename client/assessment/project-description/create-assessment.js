const storage = require('./../../storage');

module.exports = ($, placeholder) => {
    placeholder.on('click', '[data-survey-tool-action="create-new-assessment"]', (event) => {
        const surveyId = storage.getCurrent($, storage.KEYS.SURVEY_ID);
        const currentAssessmentId = storage.getCurrent($, storage.KEYS.ASSESSMENT_ID);
        const questionnaire = storage.getCurrent($, storage.KEYS.QUESTIONNAIRES)[surveyId];
        const assessmentId = storage.createAssessment(surveyId, questionnaire);

        // Assign the current info on the page to the new assessment.

        const assessment = storage.getAssessment(surveyId, assessmentId);
        if (currentAssessmentId) {
            // Data on page belongs to the current assessment, don't copy it.
            const warpjsUser = storage.getCurrent($, storage.KEYS.USER);
            assessment.mainContact = warpjsUser ? warpjsUser.Name : '';
        } else {
            // This is a new form. Data should be considered for the new
            // assessment.
            assessment.projectName = $('#project-name').val();
            assessment.mainContact = $('#main-contact').val();
            assessment.projectStatus = $('#project-status').val();
        }
        storage.updateAssessment(surveyId, assessmentId, assessment);

        const assessmentTemplateUrl = storage.getCurrent($, storage.KEYS.ASSESSMENT_TEMPLATE_URL);
        const redirectUrl = window.WarpJS.expandUrlTemplate(assessmentTemplateUrl, { surveyId, assessmentId });
        document.location.href = redirectUrl;
    });
};
