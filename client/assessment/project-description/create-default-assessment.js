var http = require('http');

const fileLoaded = require('./../../shared/load-assessment/file-loaded');

const track = require('./../../track');

module.exports = ($, placeholder, type) => {
    placeholder.on('click', '.load-sample-project', (event) => {
        track('load', 'Sample project');
        function get_json(url, callback) {
            http.get(url, (res) => {
                let body = '';
                res.on('data', (chunk) => {
                    body += chunk;
                });

                res.on('end', () => {
                    callback(body);
                });
            });
        }
        get_json(`/public/uploaded-files/${type}-acme_asset_management.txt`, (resp) => {
            fileLoaded($, placeholder, resp);
        });
    });
};
