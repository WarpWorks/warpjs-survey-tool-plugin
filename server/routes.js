const RoutesInfo = require('@quoin/expressjs-routes-info');

const constants = require('./../lib/constants');
const root = require('./root');

module.exports = (baseUrl) => {
    const routesInfo = new RoutesInfo('/', baseUrl);

    routesInfo.route(constants.routes.root, '/{domain}/{type}/{id}', root);

    return routesInfo;
};
