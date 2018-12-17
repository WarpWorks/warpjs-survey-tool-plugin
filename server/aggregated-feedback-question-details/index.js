const getQuestion = require('./get-question');

module.exports = {
    get: (req, res) => getQuestion(req, res)
};
