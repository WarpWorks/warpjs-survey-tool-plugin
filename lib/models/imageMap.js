const Promise = require('bluebird');
const RoutesInfo = require('@quoin/expressjs-routes-info');
const warpjsUtils = require('@warp-works/warpjs-utils');

const constants = require('./../constants');

class ImageMap {
    constructor(entity, instance) {
        this.id = instance.id;
        this.coords = instance.Coords;
        this.title = instance.Title;
        this.instance = instance;
        this.entity = entity;
    }

    toHal(domain) {
        return Promise.resolve()
            .then(() => RoutesInfo.expand(constants.routes.newQuestionnaire, {domain: domain, isatId: this.id}))
            .then((href) => warpjsUtils.createResource(href, {
                id: this.id,
                coords: this.coords,
                title: this.title
            }))
        ;
    }
}

module.exports = ImageMap;
