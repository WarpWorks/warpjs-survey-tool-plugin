const storage = require('./../storage');
const { classByKey, titleByKey } = require('../utils');

module.exports = ($, data) => {
    const placeholder = $('#warpjs-content-placeholder');

    storage.setCurrent($, storage.KEYS.USER, data.warpjsUser);
    storage.setCurrent($, storage.KEYS.URL, data._links.self.href);
    storage.setCurrent($, storage.KEYS.ASSESSMENT_TEMPLATE_URL, data._links.assessmentTemplate.href);
    storage.setCurrent($, storage.KEYS.DEFAULT_SURVEY_ID, data.defaultSurveyId);
    storage.setCurrent($, storage.KEYS.SURVEY_ID, data.surveyId);
    storage.setCurrent($, storage.KEYS.ASSESSMENT_ID, data.assessmentId);
    storage.setCurrent($, storage.KEYS.PROJECT_EMAIL_URL, data._links.projectEmail.href);

    $('.spider-button[data-toggle="tooltip"]', placeholder).tooltip({ trigger: 'hover' });
    $('.copyright[data-toggle="tooltip"], .copyright-mm[data-toggle="tooltip"]', placeholder).tooltip({
        container: 'body',
        trigger: 'click'
    });

    const key = (data._embedded.questionnaires && data._embedded.questionnaires[0].key) ? data._embedded.questionnaires[0].key : null;
    const hideLogo = data._embedded.hideLogo.hideLogo && data._embedded.hideLogo.hideLogo === 'yes';
    if (key) {
        const surveyKey = classByKey(key);
        $('.survey-tool').addClass(surveyKey);
        if (key !== 'ai') {
            $('.warpjs-home-link').attr('href', data._links.warpjsHomepage.href);
            $('.logo').addClass('logo-show');
        }
        $(`.survey-tool.${surveyKey} .survey-type-${surveyKey} h2`).text(titleByKey(key));
    } else if (!hideLogo) {
        $('.warpjs-home-link').attr('href', data._links.warpjsHomepage.href);
        $('.logo').addClass('logo-show');
    }

    $(document).on('click', '.closed[data-toggle="tooltip"]', (event) => {
        $(event.target).removeClass('closed');
        $(event.target).addClass('open');
        $(event.target).tooltip('open');
    });

    $(document).on('click', '.open[data-toggle="tooltip"]', (event) => {
        $(event.target).removeClass('open');
        $(event.target).addClass('closed');
        $(event.target).tooltip('close');
    });

    $(document).on('click', '.close-copyright', () => {
        $('[data-toggle="tooltip"]').tooltip('hide');
    });
};
