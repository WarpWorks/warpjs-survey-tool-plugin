const { TITLES } = require('../constants');

const isMM = require('./is-mm');
const labelByKey = require('./label-by-key');

module.exports = (key) => labelByKey(key) || (isMM(key) ? TITLES.MM : (key === 'ai' ? TITLES.AI : TITLES.IPT));
