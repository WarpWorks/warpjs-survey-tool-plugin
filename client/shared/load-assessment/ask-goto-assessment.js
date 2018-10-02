const gotoAssessment = require('./goto-assessment');
const loadAssessmentPopup = require('./load-assessment-popup');

module.exports = ($, placeholder, obj) => {
    const div = loadAssessmentPopup($, placeholder, "Data imported. Do you want to load the assessment?", [
        { btnClass: 'primary', action: 'load-yes', label: "Yes" },
        { btnClass: 'default', action: 'load-no', label: "No" }
    ]);

    $('[data-survey-tool-action="load-yes"]', div).on('click', function() {
        gotoAssessment($, placeholder, obj);
    });

    $('[data-survey-tool-action="load-no"]', div).on('click', function() {
        div.remove();
    });
};
