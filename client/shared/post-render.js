const storage = require('./../storage');

module.exports = ($, data) => {
    const placeholder = $('#warpjs-content-placeholder');

    storage.setCurrent($, 'warpjsUser', data.warpjsUser);
    storage.setCurrent($, 'surveyToolUrl', data._links.self.href);
    storage.setCurrent($, 'surveyToolAssessmentTemplateUrl', data._links.assessmentTemplate.href);
    storage.setCurrent($, 'surveyToolDefaultSurveyId', data.defaultSurveyId);
    storage.setCurrent($, 'surveyId', data.surveyId);
    storage.setCurrent($, 'assessmentId', data.assessmentId);

    $('.warpjs-home-link').attr('href', data._links.warpjsHomepage.href);
    $('.spider-button[data-toggle="tooltip"]', placeholder).tooltip({trigger: 'hover'});
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
