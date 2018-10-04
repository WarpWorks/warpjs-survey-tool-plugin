const RoutesInfo = require('@quoin/expressjs-routes-info');
const { routes } = require('./../lib/constants');

const assessment = require('./assessment');
const docx = require('./docx');
const root = require('./root');

module.exports = (baseUrl) => {
    const routesInfo = new RoutesInfo('/', baseUrl);

    routesInfo.route(routes.root, '/', root);
    routesInfo.route(routes.assessment, '/{surveyId}{?assessmentId}', assessment);
    routesInfo.route(routes.docx, '/export/docx', docx);

    return routesInfo;
};
