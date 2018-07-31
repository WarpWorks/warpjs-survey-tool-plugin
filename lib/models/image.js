const Promise = require('bluebird');
const RoutesInfo = require('@quoin/expressjs-routes-info');
const warpjsUtils = require('@warp-works/warpjs-utils');

const constants = require('./../constants');

class Image {
    constructor(entity, instance) {
        this.id = instance.id;
        this.name = instance.Name;
        this.label = instance.Label;
        this.content = instance.Description;
        this.url = instance.ImageURL;
        this.instance = instance;
        this.entity = entity;
    }

    toHal(domain, pluginConfig, persistence) {
        return Promise.resolve()
            .then(() => RoutesInfo.expand(constants.routes.newQuestionnaire, {domain: domain, isatId: this.id}))
            .then((href) => warpjsUtils.createResource(href, {
                id: this.id,
                name: this.name,
                label: this.label,
                content: this.content,
                url: this.url
            }))
        ;
    }
}

module.exports = Image;
