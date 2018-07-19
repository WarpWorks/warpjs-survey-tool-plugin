const Promise = require('bluebird');
const RoutesInfo = require('@quoin/expressjs-routes-info');
const warpjsUtils = require('@warp-works/warpjs-utils');

const constants = require('./../constants');

class Questionnaire {
    constructor(entity, instance) {
        this.id = instance.id;
        this.name = instance.Name;
    }

    toHal(domain) {
        const href = RoutesInfo.expand(constants.routes.newQuestionnaire, {domain: domain, isatId: this.id});
        const resource = warpjsUtils.createResource(href, {
            id: this.id,
            name: this.name
        });

        return resource;
    }

    setNewAttempt(persistence, collection, data) {
        return Promise.resolve()
            .then(() => persistence.save(collection, data))
            .then((saveResult) => saveResult.id)
        ;
    }

    setAttemptName(persistence) {

    }

    SetAttemptLevel(persistence) {

    }
}

module.exports = Questionnaire;
