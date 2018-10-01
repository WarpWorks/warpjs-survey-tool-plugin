const Storage = require('./../storage');

module.exports = ($, placeholder) => {
    placeholder.on('click', '[data-survey-tool-action="create-new-assessment"]', function() {
        const item = $(this).closest('.survey-tool-item');
        const surveyId = item.data('surveyToolId');
        const assessmentTemplateUrl = $(this).closest('.survey-tool-section').data('surveyToolAssessmentTemplateUrl');

        const storage = new Storage();
        const assessmentId = storage.createAssessment(surveyId);

        const redirectUrl = window.WarpJS.expandUrlTemplate(assessmentTemplateUrl, { surveyId, assessmentId });

        location.href = redirectUrl;
    });
};
