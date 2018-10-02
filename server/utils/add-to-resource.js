const { routes } = require('./../../lib/constants');

module.exports = (resource, RoutesInfo) => {
    resource.defaultSurveyId = '5b683a769e3c940010310dda'; // FIXME: Hard-coded

    resource.link('assessmentTemplate', {
        href: RoutesInfo.expand(routes.assessment),
        title: "Url to get assessment",
        templated: true
    });
};
