const storage = require('./../../storage');

module.exports = ($, placeholder) => {
    placeholder.on('change', '#project-email', async () => {
        const projectEmail = $('#project-email').val();

        const projectEmailUrl = storage.getCurrent($, storage.KEYS.PROJECT_EMAIL_URL);
        await window.WarpJS.proxy.post($, projectEmailUrl, {
            projectEmail
        });
    });
};
