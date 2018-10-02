const RoutesInfo = require('@quoin/expressjs-routes-info');
const warpjsUtils = require('@warp-works/warpjs-utils');

const addToResource = require('./add-to-resource');

module.exports = async (req, res, resource, status) => {
    addToResource(resource, RoutesInfo);

    await warpjsUtils.sendHal(req, res, resource, RoutesInfo, status);
};
