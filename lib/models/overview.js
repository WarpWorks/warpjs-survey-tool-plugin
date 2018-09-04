const Promise = require('bluebird');
const warpjsUtils = require('@warp-works/warpjs-utils');

class Overview {
    constructor(entity, instance) {
        this.id = instance.id;
        this.heading = instance.Heading;
        this.content = instance.Content;
        this.position = instance.Position;
        this.instance = instance;
        this.entity = entity;
    }

    toHal(domain, pluginConfig, persistence) {
        return Promise.resolve()
            .then(() => warpjsUtils.createResource('', {
                id: this.id,
                content: this.content,
                heading: this.heading,
                position: this.position
            }))
        ;
    }
}

module.exports = Overview;
