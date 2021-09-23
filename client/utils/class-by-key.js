const isMM = require('./is-mm');

module.exports = (key) => isMM(key) ? 'mm' : (key === 'ai' ? 'ai' : 'ipt');
