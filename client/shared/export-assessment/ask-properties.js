const template = require('./ask-properties.hbs');

module.exports = ($, placeholder) => {
    $('.blue-button-container', placeholder).append(template());
};
