const createWordDocument = require('./create-word-document');
module.exports = {
    post: (req, res) => createWordDocument(req, res)
};
