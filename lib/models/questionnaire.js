const warpjsUtils = require('@warp-works/warpjs-utils');

class Questionnaire {
    constructor(entity, instance) {
        this.id = instance.id;
        this.name = instance.Name;
        this.link = `${entity.parent.name}/start/${instance.id}`;
    }

    toHal() {
        const resource = warpjsUtils.createResource(this.link, {
            id: this.id,
            name: this.name
        });

        return resource;
    }
}

module.exports = Questionnaire;
