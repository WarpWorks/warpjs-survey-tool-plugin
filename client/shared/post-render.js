const storage = require('./../storage');

module.exports = ($, data) => {
    const placeholder = $('#warpjs-content-placeholder');

    storage.setCurrent($, storage.KEYS.USER, data.warpjsUser);
    storage.setCurrent($, storage.KEYS.URL, data._links.self.href);
    storage.setCurrent($, storage.KEYS.ASSESSMENT_TEMPLATE_URL, data._links.assessmentTemplate.href);
    storage.setCurrent($, storage.KEYS.DEFAULT_SURVEY_ID, data.defaultSurveyId);
    storage.setCurrent($, storage.KEYS.SURVEY_ID, data.surveyId);
    storage.setCurrent($, storage.KEYS.ASSESSMENT_ID, data.assessmentId);
    storage.setCurrent($, storage.KEYS.PROJECT_EMAIL_URL, data._links.projectEmail.href);

    $('.warpjs-home-link').attr('href', data._links.warpjsHomepage.href);
    $('.spider-button[data-toggle="tooltip"]', placeholder).tooltip({ trigger: 'hover' });
    $('.copyright[data-toggle="tooltip"], .copyright-mm[data-toggle="tooltip"]', placeholder).tooltip({
        container: 'body',
        trigger: 'click'
    });

    if (data._embedded.questionnaires && data._embedded.questionnaires[0].key) {
        $('.survey-tool').addClass(data._embedded.questionnaires[0].key);
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
