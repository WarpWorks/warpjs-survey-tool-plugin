const template = require('./template.hbs');

module.exports = ($) => {
    const placeholder = $('#warpjs-content-placeholder');
    placeholder.html(template());

    return placeholder;
};
