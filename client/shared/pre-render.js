const template = require('./template.hbs');

module.exports = ($) => {
    const placeholder = $('#warpjs-content-placeholder');
    placeholder.html(template());

    if ($('.survey-tool').length) {
        $('#warpjs-top-banner').addClass('survey-tool-banner');
    }

    return placeholder;
};
