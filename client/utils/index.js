const classByKey = require('./class-by-key');
const isMM = require('./is-mm');
const titleByKey = require('./title-by-key');

module.exports = Object.freeze({
    classByKey,
    isIPT: (key) => !isMM(key),
    isMM,
    titleByKey
});
