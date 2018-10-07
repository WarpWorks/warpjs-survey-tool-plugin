const storage = require('./../storage');

module.exports = ($, placeholder) => {
    placeholder.on('click', '[data-survey-tool-action="create-new-assessment"]', (event) => {
        const surveyId = $(event.target).closest('.survey-tool-item').data('surveyToolSurveyId');
        const assessmentTemplateUrl = storage.getCurrent($, 'surveyToolAssessmentTemplateUrl');
        const questionnaires = storage.getCurrent($, 'surveyToolQuestionnaires');
        const questionnaire = questionnaires[surveyId];

        const assessmentId = storage.createAssessment(surveyId, questionnaire);

        const redirectUrl = window.WarpJS.expandUrlTemplate(assessmentTemplateUrl, { surveyId, assessmentId });

        document.location.href = redirectUrl;
    });
};
