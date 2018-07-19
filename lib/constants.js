const _ = require('lodash');
const ActionPlugin = require('@warp-works/warpjs-action-plugin');
const packageJson = require('./../package.json');

const NAMESPACE = 'W2:plugin:ipt';
const baseConstants = ActionPlugin.baseConstants(packageJson);
const versionedName = baseConstants.versionedName;
const versionedNameWizard = `${versionedName}-wizard`;

console.log('versionedNameWizard:: ', versionedNameWizard);

module.exports = Object.freeze(_.extend({}, baseConstants, {
    routes: Object.freeze({
        asset: `${NAMESPACE}:assets`,
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
