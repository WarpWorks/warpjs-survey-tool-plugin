const constants = require('./../../lib/constants');

module.exports = {
    public: {
        src: [
            constants.folders.assets
        ]
    },
    nyc: {
        src: [
            '.nyc_output',
            'reports'
        ]
    },
    pack: {
        src: [
            `${constants.basename}-*.tgz`
        ]
    }
};
