module.exports = ($, placeholder, obj) => {
    const templateUrl = placeholder.data('surveyToolAssessmentTemplateUrl');
    const redirectUrl = window.WarpJS.expandUrlTemplate(templateUrl, obj);
    document.location.href = redirectUrl;
};
