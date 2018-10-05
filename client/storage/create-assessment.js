const uuid = require('uuid/v4');

const updateAssessment = require('./update-assessment');

module.exports = (surveyId, questionnaire) => {
    const assessmentId = uuid();
    const assessment = questionnaire.generateDefaultAssessment(uuid, assessmentId);

    updateAssessment(surveyId, assessmentId, assessment);
    return assessmentId;
};
