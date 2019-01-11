const newResultFeedback = require('./new-result-feedback');

module.exports = {
    patch: (req, res) => newResultFeedback(req, res)
};
