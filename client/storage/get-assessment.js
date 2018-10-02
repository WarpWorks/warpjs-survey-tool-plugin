const getAssessments = require('./get-assessments');

module.exports = (surveyId, assessmentId) => getAssessments(surveyId).find((assessment) => assessment.assessmentId === assessmentId);
