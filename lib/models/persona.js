const _ = require('lodash');

class Persona {
    constructor(personaId) {
        this.id = personaId;
        this.name = null;
    }

    save(Promise, persistence, parentID) {
        return Promise.resolve()
            .then(() => this.toPersistenceJSON())
            .then((json) => _.extend({}, json, {
                parentID,
                lastUpdated: (new Date()).toISOString()
            }))
            .then((json) => persistence.save(json.type, json))
            .then((saveResult) => saveResult.id)
        ;
    }

    fromPersistence(Promise, pluginInfo, entity, instance) {
        return Promise.resolve()
            .then(() => {
                this.id = instance.id;
                this.name = instance.Name;
            })

            .then(() => this)
        ;
    }

    toHal(warpjsUtils) {
        const resource = warpjsUtils.createResource('', {
            id: this.id,
            name: this.name
        });

        return resource;
    }

    static fromHal(json) {
        const instance = new Persona();

        instance.id = json.id;
        instance.name = json.name;

        return instance;
    }
}

module.exports = Persona;
