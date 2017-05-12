const webpack = require('webpack');
const path = require('path')

const config = {
    entry: __dirname + '/app/main.js',
    devtool: 'source-map',
    output: {
        path: __dirname + '/dist',
        filename: 'dev.js',
        library: 'dyole-graph',
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    module: {
        rules: [
            {
                test: /(\.js)$/,
                loader: 'babel-loader',
                exclude: /(node_modules|bower_components)/,
                query: {
                    // cacheDirectory: true,
                    plugins: ['add-module-exports'],
                    presets: ['es2015']
                }
            }
        ]
    },
    externals: {
        jquery: {
            root: '$',
            commonjs: 'jquery',
            commonjs2: 'jquery',
            amd: 'jquery'
        },
        lodash : {
            root: "_",
            commonjs: "lodash",
            commonjs2: "lodash",
            amd: "lodash",
        },
        raphael: {
            root: "Raphael",
            commonjs: "raphael",
            commonjs2: "raphael",
            amd: "raphael",
        }
    },
    plugins: [],
    resolve: {
        modules: [path.resolve('./app')],
        extensions: ['.json', '.js']
    },
    devServer: {
        open: true,

        // hot: true, // enable HMR on the server

        port: 5000,
        contentBase: '.'
    }
};

module.exports = config;





