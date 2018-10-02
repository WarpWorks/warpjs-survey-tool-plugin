const exportAssessement = require('./export-assessment');
const loadAssessment = require('./load-assessment');

module.exports = ($, data) => {
    const placeholder = $('#warpjs-content-placeholder');
    placeholder.data('surveyToolUrl', data._links.self.href);
    placeholder.data('surveyToolAssessmentTemplateUrl', data._links.assessmentTemplate.href);
    placeholder.data('surveyToolDefaultSurveyId', data.defaultSurveyId);
    placeholder.data('surveyId', data.surveyId);
    placeholder.data('assessmentId', data.assessmentId);

    $('[data-toggle="tooltip"]', placeholder).tooltip({
        container: 'body',
        trigger: 'click'
    });

    exportAssessement($, placeholder);
    loadAssessment($, placeholder);
};
