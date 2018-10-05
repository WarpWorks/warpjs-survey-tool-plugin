const store = require('./store');

module.exports = (surveyId) => (store.get(surveyId) || []).map((assessment) => {
    assessment.name = assessment.projectName || `Default name for '${assessment.assessmentId}'`;
    return assessment;
});
