const getPluginInfo = require('./get-plugin-info');
const sendErrorHal = require('./send-error-hal');
const sendHal = require('./send-hal');

module.exports = Object.freeze({
    getPluginInfo: (req) => getPluginInfo(req),
    sendErrorHal: async (req, res, resource, err, status) => await sendErrorHal(req, res, resource, err, status),
    sendHal: async (req, res, resource, err, status) => await sendHal(req, res, resource, err, status)
});
