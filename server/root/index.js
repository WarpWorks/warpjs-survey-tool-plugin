const getAllQuesitonnaires = require('./get-all-questionnaires');

module.exports = {
    get: (req, res) => getAllQuesitonnaires(req, res)
};
