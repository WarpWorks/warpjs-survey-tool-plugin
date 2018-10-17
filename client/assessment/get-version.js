module.exports = (assessment) => {
    let version;
    if (assessment._meta && assessment._meta.history && assessment._meta.history.length) {
        version = 'version ' + assessment._meta.history[assessment._meta.history.length - 1].revision;
    } else if (assessment.exportProperties) {
        version = 'version ' + assessment.exportProperties.revision;
    } else {
        version = '';
    }

    return version;
};
