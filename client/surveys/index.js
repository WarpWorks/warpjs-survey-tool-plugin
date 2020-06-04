const Promise = require('bluebird');

const assessmentName = require('./assessment-name');
const createAssessment = require('./create-assessment');
const deleteAction = require('./delete-action');
const errorTemplate = require('./../error.hbs');
const fetchAssessments = require('./fetch-assessments');
const Questionnaire = require('./../../lib/models/questionnaire');
const shared = require('./../shared');
const storage = require('./../storage');
const template = require('./template.hbs');

(($) => $(document).ready(() => {
    const loader = window.WarpJS.toast.loading($, "Page is loading");
    const placeholder = shared.preRender($);

    storage.setCurrent($, storage.KEYS.SURVEY_ID, undefined);
    storage.setCurrent($, storage.KEYS.ASSESSMENT_ID, undefined);

    return Promise.resolve()
        .then(() => window.WarpJS.getCurrentPageHAL($))
        .then((result) => {
            if (result.error) {
                shared.setSurveyContent($, placeholder, errorTemplate(result.data));
            } else {
                console.log('result.data', result.data);
                const content = template({ page: result.data, loggedIn: result.data.warpjsUser !== null });
                shared.setSurveyContent($, placeholder, content);

                if (result.data && result.data._embedded && result.data._embedded.questionnaires) {
                    storage.setCurrent($, storage.KEYS.QUESTIONNAIRES, result.data._embedded.questionnaires.reduce(
                        (cumulator, questionnaire) => {
                            cumulator[questionnaire.id] = Questionnaire.fromHal(questionnaire);
                            return cumulator;
                        },
                        {}
                    ));
                }
            }
            shared.postRender($, result.data);
            fetchAssessments($, placeholder);
            assessmentName($, placeholder);
            createAssessment($, placeholder);
            deleteAction($, placeholder);
        })
        .finally(() => window.WarpJS.toast.close($, loader))
    ;
}))(jQuery);
