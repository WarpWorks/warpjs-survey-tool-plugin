const loadAssessment = require('./load-assessment');

module.exports = ($) => {
    const placeholder = $('#warpjs-content-placeholder');

    $('[data-toggle="tooltip"]', placeholder).tooltip({
        container: 'body',
        trigger: 'click'
    });

    loadAssessment($, placeholder);
};
