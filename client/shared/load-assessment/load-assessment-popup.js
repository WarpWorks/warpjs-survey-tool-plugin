const template = require('./template.hbs');

module.exports = ($, placeholder, message, obj, buttons) => {
    const div = $(template({ message, buttons, exportProperties: obj.exportProperties }));

    $('.blue-button-container', placeholder).append(div);
    return div;
};