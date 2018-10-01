const RoutesInfo = require('@quoin/expressjs-routes-info');
const warpjsUtils = require('@warp-works/warpjs-utils');

const { routes } = require('./../../lib/constants');

module.exports = (req, res) => {
    const { id } = req.params;
    const { assessmentId } = req.body;

    const resource = warpjsUtils.createResource(req, {
        title: `New assessment`,
        id,
        assessmentId
    });

    resource.link('redirect', RoutesInfo.expand(routes.assessment, { id, assessmentId }));

    warpjsUtils.wrapWith406(res, {
        [warpjsUtils.constants.HAL_CONTENT_TYPE]: () => {
            warpjsUtils.sendHal(req, res, resource, RoutesInfo);
        }
    });
};
