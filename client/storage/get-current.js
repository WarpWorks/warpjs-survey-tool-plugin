const store = require('./store');

module.exports = () => store.get('current') || {};
