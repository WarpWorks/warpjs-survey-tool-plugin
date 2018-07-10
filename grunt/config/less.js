const path = require('path');

const constants = require('./../../lib/constants');

module.exports = {
    options: {
        compress: true
    },

    default: {
        files: [{
            dest: path.join(constants.folders.assets, constants.assets.css),
            src: 'client/style.less'
        }]
    }
};
