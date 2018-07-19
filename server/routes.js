const RoutesInfo = require('@quoin/expressjs-routes-info');

const constants = require('./../lib/constants');
const wizard = require('./wizard');
const root = require('./root');

module.exports = (baseUrl) => {
    const routesInfo = new RoutesInfo('/', baseUrl);

    routesInfo.route(constants.routes.root, '/{domain}', root);
    routesInfo.route(constants.routes.newQuestionnaire, '/{domain}/ipt-isat/{isatId}', root);
    routesInfo.route(constants.routes.wizard, '/{domain}/wizard/{wizardId}', wizard);

    // routesInfo.route(constants.routes.root, '/{domain}', root);
    // routesInfo.route(constants.routes.root, '/{domain}/{type}/{id}', root);

    return routesInfo;
};
