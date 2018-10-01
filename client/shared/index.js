const postRender = require('./post-render');
const preRender = require('./pre-render');
const setSurveyContent = require('./set-survey-content');

module.exports = Object.freeze({
    postRender: ($) => postRender($),
    preRender: ($) => preRender($),
    setSurveyContent: ($, placeholder, content) => setSurveyContent($, placeholder, content)
});
