const RoutesInfo = require('@quoin/expressjs-routes-info');
const { routes } = require('./../lib/constants');

const assessment = require('./assessment');
const docx = require('./docx');
const root = require('./root');
const aggregatedRsFeedback = require('./aggregated-rs-feedback');
const aggregatedFeedbackQuestionDetails = require('./aggregated-feedback-question-details');
const resultQuestionFeedback = require('./result-question-feedback');

module.exports = (baseUrl) => {
    const routesInfo = new RoutesInfo('/', baseUrl);

    routesInfo.route(routes.root, '/', root);
    routesInfo.route(routes.aggregatedRsFeedback, '/aggregated-feedback/resultset/{typeId}', aggregatedRsFeedback);
    routesInfo.route(routes.aggregatedFeedbackQuestionDetails, '/aggregated-feedback/question-details/{resultId}/{questionId}/{thumbDirection}', aggregatedFeedbackQuestionDetails);
    routesInfo.route(routes.resultQuestionFeedback, '/feedback/result-question/{resultId}/{questionId}', resultQuestionFeedback);
    routesInfo.route(routes.assessment, '/{surveyId}{?assessmentId}', assessment);
    routesInfo.route(routes.docx, '/export/docx', docx);
    return routesInfo;
};
