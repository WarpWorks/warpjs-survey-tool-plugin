const storage = require('./../storage');

module.exports = ($, placeholder) => {
    placeholder.on('click', '[data-survey-tool-action="create-new-assessment"]', (event) => {
        const surveyId = storage.getCurrent($, 'surveyId');
        const questionnaire = storage.getCurrent($, 'surveyToolQuestionnaires')[surveyId];
        const assessmentId = storage.createAssessment(surveyId, questionnaire);

        // Assign the current info on the page to the new assessment.

        const assessment = storage.getAssessment(surveyId, assessmentId);
        assessment.projectName = $('#project-name').val();
        assessment.mainContact = $('#main-contact').val();
        assessment.projectStatus = $('#project-status').val();
        storage.updateAssessment(surveyId, assessmentId, assessment);

        const assessmentTemplateUrl = storage.getCurrent($, 'surveyToolAssessmentTemplateUrl');
        const redirectUrl = window.WarpJS.expandUrlTemplate(assessmentTemplateUrl, { surveyId, assessmentId });
        document.location.href = redirectUrl;
    });
};
