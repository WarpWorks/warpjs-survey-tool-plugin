const uuid = require('uuid/v4');

const updateAssessment = require('./update-assessment');

module.exports = (surveyId) => {
    const assessmentId = uuid();

    const assessment = {
        surveyId,
        assessmentId,
        data: {
            levelOfDetail: 1,
            projectName: '',
            mainContact: '',
            projectStatus: '',
            solutionCanvas: ''
        }
    };

    updateAssessment(surveyId, assessmentId, assessment);
    return assessmentId;
};
