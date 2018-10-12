const storage = require('./../../storage');

module.exports = ($, placeholder, obj) => {
    const templateUrl = storage.getCurrent($, 'surveyToolAssessmentTemplateUrl');
    const redirectUrl = window.WarpJS.expandUrlTemplate(templateUrl, obj);
    document.location.href = redirectUrl;
};
