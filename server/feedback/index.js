const getTypes = require('./get-types');

module.exports = {
    get: (req, res) => getTypes(req, res)
};
