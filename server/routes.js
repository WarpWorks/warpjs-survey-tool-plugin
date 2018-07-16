const RoutesInfo = require('@quoin/expressjs-routes-info');

const constants = require('./../lib/constants');
// const newWizard = require('./new-wizard');
// const wizard = require('./wizard');
const root = require('./root');

module.exports = (baseUrl) => {
    const routesInfo = new RoutesInfo('/', baseUrl);

    routesInfo.route(constants.routes.root, '/{domain}', root);

    return routesInfo;
};
