const assessmentsTemplate = require('./assessments.hbs');
const Storage = require('./../storage');

module.exports = ($, placeholder) => {
    $('.survey-tool-section .survey-tool-item', placeholder).each((index, element) => {
        const assessmentTemplateUrl = $('.ipt-body .survey-tool-section', placeholder).data('surveyToolAssessmentTemplateUrl');

        const surveyId = $(element).data('surveyToolId');
        const storage = new Storage();
        const assessments = storage.getAssessments(surveyId).map((assessment) => {
            assessment.href = window.WarpJS.expandUrlTemplate(assessmentTemplateUrl, assessment);
            console.log("assessment=", assessment);
            return assessment;
        });

        const content = assessmentsTemplate({ assessments });

        $(element).find('.survey-tool-item-assessments').html(content);
    });
};
