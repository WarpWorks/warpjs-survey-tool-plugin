const getAllQuestionnaires = require('./get-all-questionnaires');
// const createQuestionnaireInstance = require('./create-questionnaire-instance');

module.exports = {
    get: (req, res) => getAllQuestionnaires(req, res)
    // post: (req, res) => createQuestionnaireInstance(req, res)
};
