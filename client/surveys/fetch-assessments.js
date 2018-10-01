const assessmentsTemplate = require('./assessments.hbs');
const Storage = require('./../storage');

module.exports = ($, placeholder) => {
    $('.survey-tool-section .survey-tool-item', placeholder).each((index, element) => {
        const surveyId = $(element).data('surveyToolId');
        const storage = new Storage();
        const assessments = storage.getAssessments(surveyId);
        const content = assessmentsTemplate({ assessments });

        $(element).find('.survey-tool-item-assessments').html(content);
    });
};
