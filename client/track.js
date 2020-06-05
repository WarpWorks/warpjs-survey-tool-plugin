/*
 *  https://developers.google.com/analytics/devguides/collection/gtagjs/events
 *
 *  gtag('event', <action>, {
 *    event_category: <category>,
 *    event_label: <label>,
 *    value: <value>,
 *  });
 */

const storage = require('./storage');

const PREFIX = 'SurveyTool';

module.exports = (action, eventLabel) => {
    // console.log(`track(action=${action}, eventLabel=${eventLabel})`);

    const surveyId = storage.getCurrent($, storage.KEYS.SURVEY_ID);
    const questionnaires = storage.getCurrent($, storage.KEYS.QUESTIONNAIRES);
    const questionnaire = questionnaires[surveyId];

    const eventAction = `${PREFIX}-${action}`;
    const eventCategory = `${PREFIX}-${questionnaire.key}`;

    // console.log(`gtag('event', '${eventAction}', { event_category: '${eventCategory}', event_label: '${eventLabel}' })`);
    if (window && window.gtag) {
        window.gtag('event', eventAction, { event_category: eventCategory, event_label: eventLabel });
    }
};
