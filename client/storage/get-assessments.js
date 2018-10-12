const store = require('./store');

module.exports = (surveyId) => store.get(surveyId) || [];
