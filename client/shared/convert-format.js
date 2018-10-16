module.exports = ($, assessment) => {
    if (assessment) {
        if (!assessment._meta) {
            assessment._meta = {history: []};
        }

        if (assessment.exportProperties) {
            assessment.exportProperties.timestamp = assessment.exportProperties.timestamp ? assessment.exportProperties.timestamp : 1;
            assessment._meta.history.push(assessment.exportProperties);
            delete assessment.exportProperties;
        } else if (!assessment._meta.history.length) {
            assessment._meta.history.push({
                name: "",
                revision: "1.0",
                description: "",
                timestamp: Date.now()
            });
        }
    }

    return assessment;
};
