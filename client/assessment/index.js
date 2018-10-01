const Promise = require('bluebird');

const cannotFindAssessmentTemplate = require('./cannot-find-assessment.hbs');
const errorTemplate = require('./../error.hbs');
const saveAssessment = require('./save-assessment');
const shared = require('./../shared');
const Storage = require('./../storage');

(($) => $(document).ready(() => {
    const loader = window.WarpJS.toast.loading($, "Page is loading");
    const placeholder = shared.preRender($);

    return Promise.resolve()
        .then(() => window.WarpJS.getCurrentPageHAL($))
        .then((result) => {
            if (result.error) {
                $('.ipt-body', placeholder).html(errorTemplate(result.data));
            } else {
                const storage = new Storage();
                const assessment = storage.getAssessment(result.data.id, result.data.assessmentId);
                if (assessment) {
                    $('.ipt-body', placeholder).html("TODO: display questionnaire...");
                    saveAssessment($, placeholder, result.data.id, result.data.assessmentId);
                } else {
                    $('.ipt-body', placeholder).html(cannotFindAssessmentTemplate({ assessmentId: result.data.assessmentId }));
                }
            }
            shared.postRender($);
        })
        .then(() => shared.postRender($))
        .finally(() => window.WarpJS.toast.close($, loader))
    ;
}))(jQuery);
