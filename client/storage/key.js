// Hopefully it will be possible to put all the assessments for a given survey
// in a single key and not reach the limits.

const STORAGE_KEY = 'warpjs-survey-tool-plugin';

module.exports = (surveyId) => `${STORAGE_KEY}-${surveyId}`;
