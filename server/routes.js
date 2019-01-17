const RoutesInfo = require('@quoin/expressjs-routes-info');
const { routes } = require('./../lib/constants');

const assessment = require('./assessment');
const docx = require('./docx');
const root = require('./root');
const aggregatedRsFeedback = require('./aggregated-rs-feedback');
const aggregatedFeedbackQuestionDetails = require('./aggregated-feedback-question-details');
const resultFeedback = require('./result-feedback');

module.exports = (baseUrl) => {
    const routesInfo = new RoutesInfo('/', baseUrl);

    routesInfo.route(routes.root, '/', root);
    routesInfo.route(routes.aggregatedRsFeedback, '/aggregated-feedback/resultset/{surveyId}/{typeId}', aggregatedRsFeedback);
    routesInfo.route(routes.aggregatedFeedbackQuestionDetails, '/aggregated-feedback/question-details/{surveyId}/{resultsetId}/{resultId}/{questionId}/{thumbDirection}', aggregatedFeedbackQuestionDetails);
    routesInfo.route(routes.resultFeedback, '/result-feedback/result', resultFeedback);
    routesInfo.route(routes.assessment, '/{surveyId}{?assessmentId}', assessment);
    routesInfo.route(routes.docx, '/export/docx', docx);
    return routesInfo;
};
