const utils = require('./../utils');

module.exports = async (req, res) => {
    const { surveyId } = req.params;
    console.log('surveyId=', surveyId);
    const { projectEmail } = req.body;
    console.log('projectEmail=', projectEmail);

    const pluginInfo = utils.getPluginInfo(req);
    const domain = pluginInfo.domain;

    console.log('domain=', domain);

    res.status(204).send();
};
