const getQuestionnaireInstance = require('./get-questionnaire-instance');
const updateQuestionnaireInstance = require('./update-questionnaire-instance.js');
module.exports = {
    get: (req, res) => getQuestionnaireInstance(req, res),
    patch: (req, res) => updateQuestionnaireInstance(req, res)
};
