const storage = require('./../../storage');

module.exports = ($, placeholder, obj) => {
    const templateUrl = storage.getCurrent($, storage.KEYS.ASSESSMENT_TEMPLATE_URL);
    const redirectUrl = window.WarpJS.expandUrlTemplate(templateUrl, obj);
    document.location.href = redirectUrl;
};
