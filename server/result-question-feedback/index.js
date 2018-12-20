const newResultQuestionFeedback = require('./new-result-question-feedback');

module.exports = {
    post: (req, res) => newResultQuestionFeedback(req, res)
};
