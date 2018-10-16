const generateFilename = require('./generate-filename');
const htmlDownload = require('./../html-download');
const storage = require('./../../storage');
const askProperties = require('./ask-properties');
const convertFormat = require('./../convert-format');

module.exports = ($, placeholder) => {
    const { surveyId, assessmentId } = storage.getCurrent($);

    if (assessmentId) {
        let assessment = storage.getAssessment(surveyId, assessmentId);
        assessment = convertFormat($, assessment);
        $('[data-survey-tool-action="download-json"]', placeholder).show();

        $('[data-survey-tool-action="download-json"]', placeholder).on('click', function() {
            askProperties($, placeholder, assessment);
        });
        placeholder.on('click', '.survey-tool-export-assessment-properties [data-survey-tool-action="export"]', function() {
            assessment._meta.history.push({
                name: $('.survey-tool-export-assessment-properties [name="name"]', placeholder).val(),
                revision: $('.survey-tool-export-assessment-properties [name="revision"]', placeholder).val(),
                description: $('.survey-tool-export-assessment-properties [name="description"]', placeholder).val(),
                timestamp: Date.now()
            });

            const filename = generateFilename(assessment);

            htmlDownload($, assessment, filename, 'text/plain');
            $('.survey-tool-export-assessment-properties', placeholder).remove();
        });

        placeholder.on('click', '.survey-tool-export-assessment-properties [data-survey-tool-action="cancel"]', function() {
            $('.survey-tool-export-assessment-properties', placeholder).remove();
        });
    }
};
