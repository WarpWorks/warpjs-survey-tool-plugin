const generateFilename = require('./generate-filename');
const htmlDownload = require('./../shared/html-download');
const Storage = require('./../storage');

module.exports = ($, placeholder, surveyId, assessmentId) => {
    $('[data-survey-tool-action="download-json"]', placeholder).show();

    $('[data-survey-tool-action="download-json"]', placeholder).on('click', function() {
        const storage = new Storage();
        const assessment = storage.getAssessment(surveyId, assessmentId);
        const filename = generateFilename(assessment);

        htmlDownload($, assessment, filename, 'text/plain');
    });
};
