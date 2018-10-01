const warpjsUtils = require('@warp-works/warpjs-utils');

const addAssessmentTemplateUrl = require('./add-assessment-template-url');

module.exports = async (req, res, resource, RoutesInfo, status) => {
    addAssessmentTemplateUrl(resource, RoutesInfo);

    await warpjsUtils.sendHal(req, res, resource, RoutesInfo, status);
};
