const getCurrentData = require('./get-current-data');

module.exports = {
    get: (req, res) => getCurrentData(req, res)
};
