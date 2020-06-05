const generateFilename = require('./generate-filename');
const htmlDownload = require('./../html-download');
const storage = require('./../../storage');
const askProperties = require('./ask-properties');
const convertFormat = require('./../convert-format');
const track = require('./../../track');

module.exports = ($, placeholder) => {
    const { surveyId, assessmentId } = storage.getCurrent($);

    if (assessmentId) {
        $('[data-survey-tool-action="download-json"]', placeholder).show();

        placeholder.on('click', '[data-survey-tool-action="download-json"]', function() {
            track('download', 'Export assessment');
            let assessment = storage.getAssessment(surveyId, assessmentId);
            assessment = convertFormat($, assessment);
            askProperties($, placeholder, assessment);
        });
        placeholder.on('click', '.survey-tool-export-assessment-properties [data-survey-tool-action="export"]', function() {
            let assessment = storage.getAssessment(surveyId, assessmentId);
            assessment = convertFormat($, assessment);
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
