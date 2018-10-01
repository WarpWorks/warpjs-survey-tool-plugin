const template = require('./template.hbs');

module.exports = ($) => {
    const placeholder = $('#warpjs-content-placeholder');
    placeholder.html(template());
    $('.progress-container', placeholder).css('display', 'none');

    return placeholder;
};
