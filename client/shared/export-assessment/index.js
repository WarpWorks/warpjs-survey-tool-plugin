const generateFilename = require('./generate-filename');
const getCurrent = require('./../get-current');
const htmlDownload = require('./../html-download');
const storage = require('./../../storage');
const askProperties = require('./ask-properties');

module.exports = ($, placeholder) => {
    const { surveyId, assessmentId } = getCurrent($, placeholder);

    if (assessmentId) {
        $('[data-survey-tool-action="download-json"]', placeholder).show();

        $('[data-survey-tool-action="download-json"]', placeholder).on('click', function() {
            askProperties($, placeholder);
        });

        placeholder.on('click', '.survey-tool-export-assessment-properties [data-survey-tool-action="export"]', function() {
            const assessment = storage.getAssessment(surveyId, assessmentId);

            assessment.exportProperties = {
                name: $('.survey-tool-export-assessment-properties [name="name"]', placeholder).val(),
                revision: $('.survey-tool-export-assessment-properties [name="revision"]', placeholder).val(),
                description: $('.survey-tool-export-assessment-properties [name="description"]', placeholder).val()
            };

            const filename = generateFilename(assessment);

            htmlDownload($, assessment, filename, 'text/plain');
            $('.survey-tool-export-assessment-properties', placeholder).remove();
        });

        placeholder.on('click', '.survey-tool-export-assessment-properties [data-survey-tool-action="cancel"]', function() {
            $('.survey-tool-export-assessment-properties', placeholder).remove();
        });
    }
};
