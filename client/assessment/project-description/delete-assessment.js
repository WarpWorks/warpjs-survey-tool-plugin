// const storage = require('./../../storage');
module.exports = ($, placeholder) => {
    // placeholder.on('click', '[data-survey-tool-action="delete-assessment"]', (event) => {
    //     event.preventDefault();
    //     console.log('triggered event');
    //     const deleteSurveyId = $(event.target).data('surveyToolSurveyId');
    //     const deleteAssessmentId = $(event.target).data('surveyToolAssessmentId');
    //     storage.removeAssessment(deleteSurveyId, deleteAssessmentId);
    //     window.location = $(event.target).data('url');
    // });
    placeholder.on('click', '[data-survey-tool-action="delete-assessment"]', (event) => {
        return window.WarpJS.toast.warning($, "Coming Soon", "DELETE");
    });
};
