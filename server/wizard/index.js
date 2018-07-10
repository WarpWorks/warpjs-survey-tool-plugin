const getAnswers = require('./get-answers');

module.exports = {
    get: (req, res) => getAnswers(req, res)
};
