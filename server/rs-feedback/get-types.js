// const debug = require('debug')('W2:plugin:survey-tool:root/get-all-questionnaires');
const Promise = require('bluebird');
const RoutesInfo = require('@quoin/expressjs-routes-info');
const warpjsUtils = require('@warp-works/warpjs-utils');

const constants = require('./../../lib/constants');
const ResultSet = require('./../../lib/models/result-set');
const utils = require('./../utils');

module.exports = (req, res) => warpjsUtils.wrapWith406(res, {
    html: () => {
        warpjsUtils.sendIndex(req, res, RoutesInfo, 'Ipt',
            [
                `${req.app.get('base-url')}/assets/${constants.assets.rsFeedback}`
            ],
            `${req.app.get('base-url')}/assets/${constants.assets.css}`
        );
    },
    [warpjsUtils.constants.HAL_CONTENT_TYPE]: async () => {
        const { typeId } = req.params;
        const pluginInfo = utils.getPluginInfo(req);
        const resource = warpjsUtils.createResource(req, {
            domain: pluginInfo.domain,
            typeId
        });

        try {
            const domainModel = await pluginInfo.warpCore.getDomainByName(pluginInfo.domain);
            const typeEntity = await domainModel.getEntityByName(pluginInfo.config.schema.resultSet);
            const typeInstance = await typeEntity.getInstance(pluginInfo.persistence, typeId);

            const typeModel = new ResultSet();
            await typeModel.fromPersistence(Promise, pluginInfo, typeEntity, typeInstance);
            const typeHAL = await typeModel.toHal(warpjsUtils, RoutesInfo, constants.routes, pluginInfo.domain);

            resource.embed('items', typeHAL);
            await utils.sendHal(req, res, resource);
        } catch (err) {
            console.error("server/root/get-types: err:", err);
            await utils.sendErrorHal(req, res, resource, err);
        } finally {
            await pluginInfo.persistence.close();
        }
    }
});
