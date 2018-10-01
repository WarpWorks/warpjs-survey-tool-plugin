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
                shared.setSurveyContent($, placeholder, errorTemplate(result.data));
            } else {
                const storage = new Storage();

                if (result.data.assessmentId) {
                    const assessment = storage.getAssessment(result.data.surveyId, result.data.assessmentId);
                    if (assessment) {
                        shared.setSurveyContent($, placeholder, "TODO: display questionnaire at slide 3.");
                        storage.setCurrent(result.data.surveyId, result.data.assessmentId);
                        saveAssessment($, placeholder, result.data.surveyId, result.data.assessmentId);
                    } else {
                        shared.setSurveyContent($, placeholder, cannotFindAssessmentTemplate({ assessmentId: result.data.assessmentId }));
                    }
                } else {
                    storage.setCurrent(result.data.surveyId);
                    shared.setSurveyContent($, placeholder, 'TODO: Display questionnaire at slide 1.');
                }
            }
        })
        .then(() => shared.postRender($))
        .finally(() => window.WarpJS.toast.close($, loader))
    ;
}))(jQuery);
