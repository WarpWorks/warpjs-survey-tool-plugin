const store = require('./store');

module.exports = (surveyId) => (store.get(surveyId) || []).map((assessment) => {
    assessment.name = assessment.data && assessment.data.projectName ? assessment.data.projectName : `Default name for '${assessment.assessmentId}'`;
    return assessment;
});
