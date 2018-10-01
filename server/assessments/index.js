const getQuestionnaire = require('./get-questionnaire');

module.exports = Object.freeze({
    get: (req, res) => getQuestionnaire(req, res)
});
