const getResult = require('./get-result');

module.exports = {
    get: (req, res) => getResult(req, res)
};
