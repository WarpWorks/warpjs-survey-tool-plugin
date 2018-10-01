const getQuestionnaire = require('./get-questionnaire');
const redirectNewQuestionnaire = require('./redirect-new-questionnaire');

module.exports = Object.freeze({
    get: (req, res) => getQuestionnaire(req, res),
    post: (req, res) => redirectNewQuestionnaire(req, res)
});
