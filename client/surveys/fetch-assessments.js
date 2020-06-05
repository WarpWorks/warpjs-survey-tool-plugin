const assessmentsTemplate = require('./assessments.hbs');
const storage = require('./../storage');

module.exports = ($, placeholder) => {
    $('.survey-tool-section .survey-tool-item', placeholder).each((index, element) => {
        const assessmentTemplateUrl = storage.getCurrent($, storage.KEYS.ASSESSMENT_TEMPLATE_URL);

        const surveyId = $(element).data('surveyToolSurveyId');
        const assessments = storage.getAssessments(surveyId).map((assessment) => {
            assessment.href = window.WarpJS.expandUrlTemplate(assessmentTemplateUrl, assessment);
            return assessment;
        });

        const content = assessmentsTemplate({ assessments });

        $(element).find('.survey-tool-item-assessments').html(content);
    });
};
