const getLatestMeta = require('./../get-latest-meta');
const template = require('./template.hbs');

module.exports = ($, placeholder, message, obj, buttons) => {
    const assessmentMeta = getLatestMeta(obj);
    const div = $(template({ message, buttons, assessmentMeta, projectName: obj.projectName }));

    $('.blue-button-container', placeholder).append(div);
    return div;
};
