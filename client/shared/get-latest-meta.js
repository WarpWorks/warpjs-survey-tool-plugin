const storage = require('./../storage');

module.exports = (assessment) => {
    let assessmentMeta = {};

    if (assessment) {
        const warjsUser = storage.getCurrent($, 'warpjsUser');
        assessmentMeta.exportName = warjsUser ? warjsUser.Name : '';
        const exportProperties = assessment._meta && assessment._meta.history && assessment._meta.history.length && assessment._meta.history[assessment._meta.history.length - 1] ? assessment._meta.history[assessment._meta.history.length - 1] : null;
        assessmentMeta.exportRevision = exportProperties && exportProperties.revision ? exportProperties.revision : '1.0';
        assessmentMeta.exportDescription = exportProperties && exportProperties.description ? exportProperties.description : '';
    }

    return assessmentMeta;
};