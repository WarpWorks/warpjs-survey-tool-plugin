const storage = require('./../storage');

module.exports = ($, placeholder) => {
    placeholder.on('click', '[data-survey-tool-action="create-new-assessment"]', (event) => {
        const surveyId = $(event.target).closest('.survey-tool-item').data('surveyToolSurveyId');
        const questionnaires = storage.getCurrent($, storage.KEYS.QUESTIONNAIRES);
        const questionnaire = questionnaires[surveyId];

        const assessmentId = storage.createAssessment(surveyId, questionnaire);

        const assessmentTemplateUrl = storage.getCurrent($, storage.KEYS.ASSESSMENT_TEMPLATE_URL);
        const redirectUrl = window.WarpJS.expandUrlTemplate(assessmentTemplateUrl, { surveyId, assessmentId });

        document.location.href = redirectUrl;
    });
};
