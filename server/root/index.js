const getAllQuesitonnaires = require('./get-all-questionnaires');
const createQuestionnaireInstance = require('./create-questionnaire-instance');

module.exports = {
    get: (req, res) => getAllQuesitonnaires(req, res),
    post: (req, res) => createQuestionnaireInstance(req, res)
};
