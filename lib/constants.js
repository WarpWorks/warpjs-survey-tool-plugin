const _ = require('lodash');
const ActionPlugin = require('@warp-works/warpjs-action-plugin');
const packageJson = require('./../package.json');

const NAMESPACE = 'W2:plugin:survey-tool';
const baseConstants = ActionPlugin.baseConstants(packageJson);

function qualifiedName(name) {
    return `${baseConstants.versionedName}-${name}`;
}

function minJs(name) {
    return `${qualifiedName(name)}.min.js`;
}

const WEBPACK_ENTRY_POINTS = [
    'surveys',
    'assessment'
];

module.exports = Object.freeze(_.extend({}, baseConstants, {
    routes: Object.freeze({
        root: `${NAMESPACE}:root`,
        assets: `${NAMESPACE}:assets`,
        assessment: `${NAMESPACE}:assessment`,
        docx: `${NAMESPACE}:docx`
        // questionnaire: `${NAMESPACE}:questionnaire`,
        // newQuestionnaire: `${NAMESPACE}:newQuestionnaire`,
        // wizard: `${NAMESPACE}:wizard`
    }),

    getWebpackEntryPoints: () => WEBPACK_ENTRY_POINTS.reduce(
        (cumulator, key) => _.extend(cumulator, {
            [qualifiedName(key)]: `./client/${key}/index.js`
        }),
        {}
    ),

    assets: Object.freeze(WEBPACK_ENTRY_POINTS.reduce(
        (cumulator, key) => _.extend(cumulator, {
            [key]: minJs(key)
        }),
        { css: `${baseConstants.versionedName}.min.css` }
    ))
}));
