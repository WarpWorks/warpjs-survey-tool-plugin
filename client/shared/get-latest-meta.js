const storage = require('./../storage');

module.exports = (assessment) => {
    const assessmentMeta = {};

    if (assessment) {
        const warjsUser = storage.getCurrent($, storage.KEYS.USER);
        assessmentMeta.exportName = warjsUser ? warjsUser.Name : '';
        const exportProperties = assessment._meta && assessment._meta.history && assessment._meta.history.length && assessment._meta.history[assessment._meta.history.length - 1] ? assessment._meta.history[assessment._meta.history.length - 1] : null;
        assessmentMeta.exportRevision = exportProperties && exportProperties.revision ? exportProperties.revision : '1.0';
        assessmentMeta.exportDescription = exportProperties && exportProperties.description ? exportProperties.description : '';
    }

    return assessmentMeta;
};
