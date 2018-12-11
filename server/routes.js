const RoutesInfo = require('@quoin/expressjs-routes-info');
const { routes } = require('./../lib/constants');

const assessment = require('./assessment');
const docx = require('./docx');
const root = require('./root');
const rsFeedback = require('./rs-feedback');
const feedbackQuestionDetails = require('./feedback-question-details');

module.exports = (baseUrl) => {
    const routesInfo = new RoutesInfo('/', baseUrl);

    routesInfo.route(routes.root, '/', root);
    routesInfo.route(routes.rsFeedback, '/feedback/resultset/{typeId}', rsFeedback);
    routesInfo.route(routes.feedbackQuestionDetails, '/feedback/question-details/{resultId}/{questionId}/{thumbDirection}', feedbackQuestionDetails);
    routesInfo.route(routes.assessment, '/{surveyId}{?assessmentId}', assessment);
    routesInfo.route(routes.docx, '/export/docx', docx);
    return routesInfo;
};
