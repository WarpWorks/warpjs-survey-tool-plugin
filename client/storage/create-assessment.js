const uuid = require('uuid/v4');

const updateAssessment = require('./update-assessment');

module.exports = (surveyId, questionnaire) => {
    const assessmentId = uuid();

    const answers = [questionnaire.generateDefaultAnswer(uuid)];

    const assessment = {
        surveyId,
        assessmentId,
        detailLevel: 1,
        mainContact: "",
        projectName: "",
        projectStatus: "",
        solutionCanvas: "",
        answers
    };

    updateAssessment(surveyId, assessmentId, assessment);
    return assessmentId;
};
