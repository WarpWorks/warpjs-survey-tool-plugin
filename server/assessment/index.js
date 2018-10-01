const wizard = require('./wizard');

module.exports = Object.freeze({
    get: (req, res) => wizard(req, res)
});
