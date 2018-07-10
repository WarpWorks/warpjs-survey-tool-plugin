const RoutesInfo = require('@quoin/expressjs-routes-info');

const constants = require('./constants');

module.exports = (domain, type, id) => RoutesInfo.expand(constants.routes.root, {domain, type, id});
