const getLatestMeta = require('./../get-latest-meta');
const template = require('./ask-properties.hbs');

module.exports = ($, placeholder, assessment) => {
    const assessmentMeta = getLatestMeta(assessment);

    if (assessmentMeta.exportRevision) {
        const replacer = (match, p1, p2, p3, groups, offset, string) => {
            const p2Int = parseInt(p2, 10);
            const p2Increment = p2Int + 1;

            return p1 + p2Increment + p3;
        };

        assessmentMeta.exportRevision = assessmentMeta.exportRevision.replace(/^(.*[^\d])(\d+)(.*)$/, replacer);
    }

    $('.blue-button-container', placeholder).append(template({name: assessment.projectName, assessmentMeta}));
};
