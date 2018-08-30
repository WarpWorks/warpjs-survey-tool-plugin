const Promise = require('bluebird');
const RoutesInfo = require('@quoin/expressjs-routes-info');
const warpjsUtils = require('@warp-works/warpjs-utils');

const constants = require('./../constants');

class Content {
    constructor(entity, instance) {
        this.id = instance.id;
        this.name = instance.Name;
        this.heading = instance.heading;
        this.Content = instance.content;
        this.instance = instance;
        this.entity = entity;
    }

    toHal(domain, pluginConfig, persistence) {
        return Promise.resolve()
            .then(() => RoutesInfo.expand(constants.routes.newQuestionnaire, {domain: domain, isatId: this.id}))
            .then((href) => warpjsUtils.createResource(href, {
                id: this.id,
                name: this.name,
                heading: this.heading,
                content: this.content
            }))
        ;
    }
}

module.exports = Content;
