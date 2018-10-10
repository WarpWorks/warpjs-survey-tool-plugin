const storage = require('./../../storage');
module.exports = ($, placeholder) => {
    placeholder.on('click', '.dropdown-delete', (event) => {
        event.stopPropagation();
        $('.dropdown-delete-actions').addClass('show-confirmation');
    });

    placeholder.on('click', '[data-survey-tool-action="delete-assessment"]', (event) => {
        event.stopPropagation();
        const deleteSurveyId = $(event.target).data('surveyToolSurveyId');
        const deleteAssessmentId = $(event.target).data('surveyToolAssessmentId');
        storage.removeAssessment(deleteSurveyId, deleteAssessmentId);
        window.location = $(event.target).data('url');
    });
    placeholder.on('click', '[data-survey-tool-action="cancel-delete"]', (event) => {
        event.stopPropagation();
        $('.dropdown-delete-actions').removeClass('show-confirmation');
    });
};
