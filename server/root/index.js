const getAllQuestionnaires = require('./get-all-questionnaires');

module.exports = {
    get: (req, res) => getAllQuestionnaires(req, res)
};
