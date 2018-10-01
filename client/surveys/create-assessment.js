const Promise = require('bluebird');

const Storage = require('./../storage');

module.exports = ($, placeholder) => {
    placeholder.on('click', '[data-survey-tool-action="create-new-assessment"]', function() {
        const item = $(this).closest('.survey-tool-item');
        const surveyId = item.data('surveyToolId');
        const surveyUrl = item.data('surveyToolUrl');

        const storage = new Storage();
        const assessmentId = storage.createAssessment(surveyId);

        return Promise.resolve()
            .then(() => window.WarpJS.proxy.post($, surveyUrl, { assessmentId }))
            .then((result) => {
                location.href = result._links.redirect.href;
            })
            .catch((err) => {
                console.error(`Issue with POST ${surveyUrl}:`, err);
                window.WarpJS.toast.error($, "Error during create a new assessment.");
            })
        ;
    });
};
