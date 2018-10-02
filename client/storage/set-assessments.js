const store = require('./store');

module.exports = (surveyId, assessments) => store.set(surveyId, assessments);
