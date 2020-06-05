const constants = require('./constants');

module.exports = Object.freeze({
    createAssessment: require('./create-assessment'),
    getAssessment: require('./get-assessment'),
    getAssessments: require('./get-assessments'),
    getCurrent: require('./get-current'),
    removeAssessment: require('./remove-assessment'),
    setAssessments: require('./set-assessments'),
    setCurrent: require('./set-current'),
    updateAssessment: require('./update-assessment'),
    KEYS: constants.KEYS
});
