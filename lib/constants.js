const packageJson = require('./../package.json');

const basename = packageJson.name.replace(/@/g, '').replace(/\//g, '-');
const version = packageJson.version;
const versionedName = `${basename}-${version}`;

module.exports = {
    appKeys: {
        baseUrl: 'base-url',
        pluginConfig: 'warpjs-plugin-config',
        staticUrl: 'static-url',
        warpCore: 'warpjs-core'
    },
    basename,
    version,
    versionedName,
    folders: {
        assets: 'assets'
    },
    assets: {
        css: `${versionedName}.min.css`,
        js: `${versionedName}.min.js`
    },
    routes: {
        assets: 'W2:plugin:ipt:assets',
        root: 'W2:plugin:ipt:root'
    },
    schema: {
        relationship: {
            for: {
                imagearea: 'Map'
            }
        }
    },
    modalName: 'ipt',
    HAL_CONTENT_TYPE: 'application/hal+json'
};
