const getQuestionnaireInstance = require('./get-questionnaire-instance');
module.exports = {
    get: (req, res) => getQuestionnaireInstance(req, res)
};
