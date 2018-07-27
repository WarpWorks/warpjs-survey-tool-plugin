const Promise = require('bluebird');
const RoutesInfo = require('@quoin/expressjs-routes-info');
const warpjsUtils = require('@warp-works/warpjs-utils');

const constants = require('./../constants');

class Option {
    constructor(entity, instance) {
        this.id = instance.id;
        this.name = instance.Name;
        this.content = instance.Description;
        this.position = instance.Position;
    }

    toHal(domain) {
        return Promise.resolve()
            .then(() => RoutesInfo.expand(constants.routes.newQuestionnaire, {domain: domain, isatId: this.id}))
            .then((href) => warpjsUtils.createResource(href, {
                id: this.id,
                name: this.name,
                content: this.content,
                position: this.position
            }))
        ;
    }
}

module.exports = Option;
