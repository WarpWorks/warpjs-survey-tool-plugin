const _ = require('lodash');
const ActionPlugin = require('@warp-works/warpjs-action-plugin');
const packageJson = require('./../package.json');

const NAMESPACE = 'W2:plugin:ipt';

module.exports = Object.freeze(_.extend({}, ActionPlugin.baseConstants(packageJson), {
    routes: Object.freeze({
        asset: `${NAMESPACE}:assets`,
        root: `${NAMESPACE}:root`,
        newQuestionnaire: `${NAMESPACE}:newQuestionnaire`
    })
}));
