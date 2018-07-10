const createNewAreas = require('./create-new-areas');
const getCurrentData = require('./get-current-data');

module.exports = {
    patch: (req, res) => createNewAreas(req, res),
    post: (req, res) => getCurrentData(req, res)
};
