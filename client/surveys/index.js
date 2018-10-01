const Promise = require('bluebird');

const createAssessment = require('./create-assessment');
const deleteAction = require('./delete-action');
const errorTemplate = require('./../error.hbs');
const fetchAssessments = require('./fetch-assessments');
const shared = require('./../shared');
const Storage = require('./../storage');
const template = require('./template.hbs');

(($) => $(document).ready(() => {
    const loader = window.WarpJS.toast.loading($, "Page is loading");
    const placeholder = shared.preRender($);

    const storage = new Storage();
    storage.setCurrent();

    return Promise.resolve()
        .then(() => window.WarpJS.getCurrentPageHAL($))
        .then((result) => {
            if (result.error) {
                shared.setSurveyContent($, placeholder, errorTemplate(result.data));
            } else {
                const content = template({ page: result.data });
                shared.setSurveyContent($, placeholder, content);
            }
            shared.postRender($);
            fetchAssessments($, placeholder);
            createAssessment($, placeholder);
            deleteAction($, placeholder);
        })
        .finally(() => window.WarpJS.toast.close($, loader))
    ;
}))(jQuery);
