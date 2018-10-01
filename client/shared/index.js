const postRender = require('./post-render');
const preRender = require('./pre-render');

module.exports = Object.freeze({
    postRender: ($) => postRender($),
    preRender: ($) => preRender($)
});
