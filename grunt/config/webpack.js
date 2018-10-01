const path = require('path');
const warpjsUtils = require('@warp-works/warpjs-utils');
const webpack = require('webpack');

const constants = require('./../../lib/constants');
const rootDir = path.dirname(require.resolve('./../../package.json'));

module.exports = {
    build: {
        target: 'web',
        devtool: 'source-map',
        entry: constants.getWebpackEntryPoints(),
        externals: {
            jquery: true
        },
        node: {
            fs: 'empty'
        },
        output: {
            path: path.join(rootDir, constants.folders.assets),
            filename: '[name].min.js'
        },
        plugins: [
            new webpack.optimize.UglifyJsPlugin({
                compress: true
            })
        ],
        module: {
            loaders: [
                {
                    test: /\.js$/,
                    loader: 'babel-loader'
                },
                {
                    test: /\.hbs$/,
                    loader: 'handlebars-loader',
                    query: {
                        helperDirs: [
                            warpjsUtils.getHandlebarsHelpersDir()
                        ],
                        partialDirs: [
                            warpjsUtils.getHandlebarsPartialsDir()
                        ]
                    }
                }
            ]
        }
    }
};
