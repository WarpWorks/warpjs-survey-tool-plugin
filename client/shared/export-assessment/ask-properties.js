const template = require('./ask-properties.hbs');

module.exports = ($, placeholder, assessment) => {
    const exportName = assessment.exportProperties && assessment.exportProperties.name ? assessment.exportProperties.name : 'Name';
    let exportRevision = assessment.exportProperties && assessment.exportProperties.revision ? assessment.exportProperties.revision : '1.0';
    const exportDescription = assessment.exportProperties && assessment.exportProperties.description ? assessment.exportProperties.description : 'Description';
    if (assessment.exportProperties && assessment.exportProperties.revision) {
        const replacer = (match, p1, p2, p3, groups, offset, string) => {
            const p2Int = parseInt(p2, 10);
            const p2Increment = p2Int + 1;

            return p1 + p2Increment + p3;
        };

        exportRevision = assessment.exportProperties.revision.replace(/^(.*[^\d])(\d+)(.*)$/, replacer);
    }

    $('.blue-button-container', placeholder).append(template({name: assessment.projectName, exportName, exportRevision, exportDescription}));
};
