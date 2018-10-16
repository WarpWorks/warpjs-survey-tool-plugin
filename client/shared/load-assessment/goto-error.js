const loadError = require('./load-error.hbs');

module.exports = ($, placeholder) => {
    const div = $(loadError());
    $('[data-survey-tool-action="error-close"]', div).on('click', function() {
        div.remove();
    });
    $('.blue-button-container', placeholder).append(div);
};
