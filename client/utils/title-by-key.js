const { TITLES } = require('../constants');

const isMM = require('./is-mm');
const labelByKey = require('./label-by-key');

module.exports = (key) => labelByKey(key) || (isMM(key) ? TITLES.MM : TITLES.IPT);
