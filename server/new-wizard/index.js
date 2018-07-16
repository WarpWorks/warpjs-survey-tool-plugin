const getQuestionnaire = require('./get-questionnaire');

module.exports = {
    get: (req, res) => getQuestionnaire(req, res)
};
