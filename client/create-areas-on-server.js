const Promise = require('bluebird');
const warpjsUtils = require('@warp-works/warpjs-utils');

module.exports = ($, url, docLevel, areas) => {
    const data = {
        areas: areas.map((area) => [area.x1, area.y1, area.x2, area.y2].join(',')),
        docLevel
    };
    return Promise.resolve()
        .then(() => warpjsUtils.proxy.patch($, url, data))
    ;
};
