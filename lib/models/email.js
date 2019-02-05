const _ = require('lodash');

class Email {
    constructor(emailId) {
        this.id = emailId;
        this.fullName = null;
        this.email = null;
    }

    toPersistenceJSON() {
        return {
            type: 'Email',
            FullName: this.fullName,
            Email: this.email
        };
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

    toHal(warpjsUtils, RoutesInfo, routes, domain) {
        const resource = warpjsUtils.createResource('', {
            id: this.id,
            fullName: this.fullName,
            email: this.email
        });

        return resource;
    }
}

module.exports = Email;
