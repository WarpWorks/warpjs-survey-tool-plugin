const constants = require('./../../lib/constants');

module.exports = (req) => {
    const config = req.app.get(constants.appKeys.pluginConfig);

    const domain = config.domainName;
    const Persistence = require(config.persistence.module);
    const persistence = new Persistence(config.persistence.host, domain);
    const warpCore = req.app.get(constants.appKeys.warpCore);

    return Object.freeze({
        config,
        domain,
        persistence,
        warpCore
    });
};
