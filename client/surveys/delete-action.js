const noAssessmentsTemplate = require('./no-assessments.hbs');
const storage = require('./../storage');

module.exports = ($, placeholder) => {
    placeholder.on('click', '[data-survey-tool-action="delete-assessment"]', function() {
        $('.survey-tool-assessment-actions', placeholder).removeClass('survey-tool-assessment-actions-confirmation');
        $(this).closest('.survey-tool-assessment-actions').addClass('survey-tool-assessment-actions-confirmation');
    });

    placeholder.on('click', '[data-survey-tool-action="cancel-delete"]', function() {
        $(this).closest('.survey-tool-assessment-actions').removeClass('survey-tool-assessment-actions-confirmation');
    });

    placeholder.on('click', '[data-survey-tool-action="confirm-delete"]', function() {
        const assessment = $(this).closest('.survey-tool-assessment');
        const container = $(this).closest('.survey-tool-item-assessments');

        storage.removeAssessment(assessment.data('surveyToolSurveyId'), assessment.data('surveyToolAssessmentId'));

        assessment.remove();

        if (!$('.survey-tool-assessment').length) {
            container.html(noAssessmentsTemplate());
        }
    });
};
