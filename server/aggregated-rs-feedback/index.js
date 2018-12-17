const getAggregatedRsFeedback = require('./get-aggregated-rs-feedback');

module.exports = {
    get: (req, res) => getAggregatedRsFeedback(req, res)
};
