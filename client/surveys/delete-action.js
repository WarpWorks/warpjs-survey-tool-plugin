const noAssessmentsTemplate = require('./no-assessments.hbs');
const storage = require('./../storage');

module.exports = ($, placeholder) => {
    placeholder.on('click', '[data-survey-tool-action="delete-assessment"]', (event) => {
        $('.survey-tool-assessment-actions', placeholder).removeClass('survey-tool-assessment-actions-confirmation');
        $(event.target).closest('.survey-tool-assessment-actions').addClass('survey-tool-assessment-actions-confirmation');
    });

    placeholder.on('click', '[data-survey-tool-action="cancel-delete"]', (event) => {
        $(event.target).closest('.survey-tool-assessment-actions').removeClass('survey-tool-assessment-actions-confirmation');
    });

    placeholder.on('click', '[data-survey-tool-action="confirm-delete"]', (event) => {
        const assessment = $(event.target).closest('.survey-tool-assessment');
        const container = $(event.target).closest('.survey-tool-item-assessments');

        storage.removeAssessment($(event.target).data('surveyToolSurveyId'), $(event.target).data('surveyToolAssessmentId'));

        assessment.remove();

        if (!$('.survey-tool-assessment', container).length) {
            container.html(noAssessmentsTemplate());
        }
    });
};
