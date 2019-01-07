const newResultQuestionFeedback = require('./new-result-question-feedback');
const getResultQuestionFeedback = require('./get-result-question-feedback');

module.exports = {
    get: (req, res) => getResultQuestionFeedback(req, res),
    patch: (req, res) => newResultQuestionFeedback(req, res)
};
