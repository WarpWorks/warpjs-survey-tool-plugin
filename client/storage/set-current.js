const store = require('./store');

module.exports = (surveyId, assessmentId) => store.set('current', { surveyId, assessmentId });
