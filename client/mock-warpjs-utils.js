const cloneDeep = require('lodash/cloneDeep');
const extend = require('lodash/extend');
const reduce = require('lodash/reduce');

class FakeHal {
    constructor(data) {
        this.data = cloneDeep(data);
        this._embedded = {};
    }

    embed(key, value) {
        if (!this._embedded[key]) {
            this._embedded[key] = [];
        }
        this._embedded[key] = this._embedded[key].concat(value);
    }

    toJSON() {
        return extend(cloneDeep(this.data), {
            _embedded: reduce(
                this._embedded,
                (memo, values, key) => {
                    // console.log("FakeHal.toJSON(): value=", value);
                    return extend(memo, {
                        [key]: values.map((value) => value.toJSON())
                    });
                },
                {}
            )
        });
    }
}

module.exports = Object.freeze({
    createResource: (href, data) => new FakeHal(data)
});
