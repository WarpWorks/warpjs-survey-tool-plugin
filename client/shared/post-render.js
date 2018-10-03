const exportAssessement = require('./export-assessment');
const loadAssessment = require('./load-assessment');
const storage = require('./../storage');

module.exports = ($, data) => {
    const placeholder = $('#warpjs-content-placeholder');

    storage.setCurrent($, 'surveyToolUrl', data._links.self.href);
    storage.setCurrent($, 'surveyToolAssessmentTemplateUrl', data._links.assessmentTemplate.href);
    storage.setCurrent($, 'surveyToolDefaultSurveyId', data.defaultSurveyId);
    storage.setCurrent($, 'surveyId', data.surveyId);
    storage.setCurrent($, 'assessmentId', data.assessmentId);

    $('[data-toggle="tooltip"]', placeholder).tooltip({
        container: 'body',
        trigger: 'click'
    });

    exportAssessement($, placeholder);
    loadAssessment($, placeholder);
};
