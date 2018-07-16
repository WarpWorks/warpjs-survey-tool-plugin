const ActionPlugin = require('@warp-works/warpjs-action-plugin');
const RoutesInfo = require('@quoin/expressjs-routes-info');

const app = require('./server/app');
const constants = require('./lib/constants');
const packageJson = require('./package.json');

class IptPlugin extends ActionPlugin {
    constructor(config, warpCore, pluginType) {
        super(config, warpCore, packageJson, pluginType);
    }

    get app() {
        return (baseUrl, staticUrl) => app(this.config, this.warpCore, baseUrl, staticUrl);
    }

    get jsScriptUrl() {
        // This plugin doesn't need any UI.
        return null;
    }

    getRootUrl(domain, type, id) {
        return RoutesInfo.expand(constants.routes.root, { domain, type, id });
    }
}

module.exports = IptPlugin;
