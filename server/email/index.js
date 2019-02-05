const createEmail = require('./create-email');
module.exports = {
    post: (req, res) => createEmail(req, res)
};
