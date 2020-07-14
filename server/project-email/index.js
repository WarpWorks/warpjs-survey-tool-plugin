const addProjectEmail = require('./add-project-email');

module.exports = Object.freeze({
    post: async (req, res) => addProjectEmail(req, res)
});
