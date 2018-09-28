const _ = require('lodash');
const ActionPlugin = require('@warp-works/warpjs-action-plugin');
const packageJson = require('./../package.json');

const NAMESPACE = 'W2:plugin:survey-tool';
const baseConstants = ActionPlugin.baseConstants(packageJson);
const versionedName = baseConstants.versionedName;
const versionedNameWizard = `${versionedName}-wizard`;

module.exports = Object.freeze(_.extend({}, baseConstants, {
    routes: Object.freeze({
        assets: `${NAMESPACE}:assets`,
        root: `${NAMESPACE}:root`,
        newQuestionnaire: `${NAMESPACE}:newQuestionnaire`,
        wizard: `${NAMESPACE}:wizard`
    }),
    versionedNameWizard: versionedNameWizard,
    assets: Object.freeze({
        css: `${versionedName}.min.css`,
        js: `${versionedName}.min.js`,
        wizardJs: `${versionedNameWizard}.min.js`
    })
}));
