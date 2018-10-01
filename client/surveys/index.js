const Promise = require('bluebird');

const createAssessment = require('./create-assessment');
const deleteAction = require('./delete-action');
const errorTemplate = require('./../error.hbs');
const fetchAssessments = require('./fetch-assessments');
const shared = require('./../shared');
const template = require('./template.hbs');

(($) => $(document).ready(() => {
    const loader = window.WarpJS.toast.loading($, "Page is loading");
    const placeholder = shared.preRender($);

    return window.WarpJS.getCurrentPageHAL($)
        .then((result) => {
            window.WarpJS.toast.close($, loader);
            if (result.error) {
                placeholder.html(errorTemplate(result.data));
            } else {
                return Promise.resolve()
                    .then(() => template({page: result.data}))
                    .then((content) => $('.ipt-body').html(content))
                    .then(() => shared.postRender($))
                    .then(() => {
                        fetchAssessments($, placeholder);
                        createAssessment($, placeholder);
                        deleteAction($, placeholder);
                    })
                ;
            }
        })
    ;
}))(jQuery);
