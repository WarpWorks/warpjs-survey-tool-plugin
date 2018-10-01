const { routes } = require('./../../lib/constants');

module.exports = (resource, RoutesInfo) => {
    resource.link('assessmentTemplate', {
        href: RoutesInfo.expand(routes.assessment),
        title: "Url to get assessment",
        templated: true
    });
};
