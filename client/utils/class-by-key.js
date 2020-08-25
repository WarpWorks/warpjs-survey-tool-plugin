const isMM = require('./is-mm');

module.exports = (key) => isMM(key) ? 'mm' : 'ipt';
