const app = require('./server/app');
const getJsScriptUrl = require('./lib/get-js-script-url');
const getPluginIdentifier = require('./lib/get-plugin-identifier');
const getRootUrl = require('./lib/get-root-url');

const plugin = (config, warpCore) => (baseUrl, staticUrl) => app(config, warpCore, baseUrl, staticUrl);

plugin.getJsScriptUrl = () => getJsScriptUrl();
plugin.getPluginIdentifier = () => getPluginIdentifier();
plugin.getRootUrl = (domain, type, id) => getRootUrl(domain, type, id);

module.exports = plugin;
