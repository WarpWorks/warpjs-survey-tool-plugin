// const debug = require('debug')('W2:plugin:imagemap-editor:server/root/get-current-data');
// const Promise = require('bluebird');
const RoutesInfo = require('@quoin/expressjs-routes-info');
// const warpjsUtils = require('@warp-works/warpjs-utils');

const constants = require('./../../lib/constants');
// const createImageResource = require('./create-image-resource');

module.exports = (req, res) => {
    // const {domain, type, id} = req.params;

    // const warpCore = req.app.get(constants.appKeys.warpCore);

    // const pluginConfig = req.app.get(constants.appKeys.pluginConfig);
    // const Persistence = require(pluginConfig.persistence.module);
    // const persistence = new Persistence(pluginConfig.persistence.host, domain);
    const halResource = {
        _links: {
            self: {href: "/ipt/123"}
        },
        name: "test",
        id: 123,
        content: "test content",
        link: `${RoutesInfo.expand('W2:plugin:ipt:assets', {})}/${constants.assets.css}`
    };
    return res.status(200)
        .header('Content-Type', constants.HAL_CONTENT_TYPE)
        .send(JSON.stringify(halResource));

    // return Promise.resolve()
    //     .then(() => warpCore.getDomainByName(domain))
    //     .then((schema) => schema.getEntityByName(type))
    //     .then((entity) => Promise.resolve()
    //         .then(() => warpjsUtils.createResource(req, {
    //             domain,
    //             type,
    //             id,
    //             docLevel: req.body.warpjsDocLevel
    //         }))
    //         .then((resource) => Promise.resolve()

    //             // For the css
    //             .then(() => resource.link('css', `${RoutesInfo.expand('W2:plugin:imagemap-editor:assets', {})}/${constants.assets.css}`))

    //             .then(() => entity.getInstance(persistence, id))
    //             .then((instance) => Promise.resolve()
    //                 .then(() => warpjsUtils.docLevel.getData(persistence, entity, instance, req.body.warpjsDocLevel))
    //                 .then((docLevelData) => createImageResource(persistence, docLevelData.model, docLevelData.instance, req.body.warpjsDocLevel))
    //                 .then((imageResource) => resource.embed('images', imageResource))
    //             )
    //             .then(() => warpjsUtils.sendHal(req, res, resource, RoutesInfo))
    //         )
    //     )
    //     .catch((err) => {
    //         console.error("server/root/get-current-data: err:", err);
    //         throw err;
    //     })
    //     .finally(() => persistence.close())
    // ;
};
