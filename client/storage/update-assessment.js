const getAssessments = require('./get-assessments');
const setAssessments = require('./set-assessments');

module.exports = (surveyId, assessmentId, assessment) => {
    const filtered = getAssessments(surveyId).filter((assessment) => assessment.assessmentId !== assessmentId);
    setAssessments(surveyId, filtered.concat(assessment));
};
