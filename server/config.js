const path = require('path');

const processCwd = path.dirname(require.resolve('./../package.json'));

const config = {
    public: process.env.PUBLIC_PATH || path.join(processCwd, '../../../..', 'w2projects', 'public')
};

module.exports = config;
