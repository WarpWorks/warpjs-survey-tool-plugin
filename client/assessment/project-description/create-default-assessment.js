var http = require('http');

const fileLoaded = require('./../../shared/load-assessment/file-loaded');

module.exports = ($, placeholder) => {
    placeholder.on('click', '.load-sample-project', (event) => {
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
        get_json('/public/uploaded-files/ipt-acme_asset_management.txt', (resp) => {
            fileLoaded($, placeholder, resp);
        });
    });
};
