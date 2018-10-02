const key = require('./key');

const STORAGE = window.localStorage;

module.exports = Object.freeze({
    get: (surveyId) => JSON.parse(STORAGE.getItem(key(surveyId)) || null),
    set: (surveyId, data) => STORAGE.setItem(key(surveyId), JSON.stringify(data))
});
