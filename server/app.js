const express = require('express');
const path = require('path');
const RoutesInfo = require('@quoin/expressjs-routes-info');
const warpjsUtils = require('@warp-works/warpjs-utils');

const constants = require('./../lib/constants');
const routes = require('./routes');

const repoRoot = path.dirname(require.resolve('../package.json'));

module.exports = (config, warpCore, baseUrl, staticUrl) => {
    const app = express();

    baseUrl = (baseUrl === '/') ? '' : baseUrl;

    app.set('view engine', 'hbs');
    app.set('views', warpjsUtils.getHandlebarsViewsDir());
    app.set(constants.appKeys.baseUrl, baseUrl);
    app.set(constants.appKeys.staticUrl, staticUrl);
    app.set(constants.appKeys.pluginConfig, config);
    app.set(constants.appKeys.warpCore, warpCore);

    RoutesInfo.staticPath(constants.routes.assets, app, baseUrl, '/assets', path.join(repoRoot, constants.folders.assets));

    app.use(routes(baseUrl || '/').router);

    return app;
};
