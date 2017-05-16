const webpack = require('webpack');

const config = {
    entry: __dirname + '/app/dyole/graph.js',
    output: {
        path: __dirname + '/dist',
        filename: 'graph.min.js',
        library: 'dyole-graph',
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /(\.js)$/,
                loader: 'babel-loader',
                exclude: /(node_modules|bower_components)/,
                query: {
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
        lodash: {
            root: '_',
            commonjs: 'lodash',
            commonjs2: 'lodash',
            amd: 'lodash',
        },
        raphael: {
            root: 'Raphael',
            commonjs: 'raphael',
            commonjs2: 'raphael',
            amd: 'raphael',
        }
    },
    resolve: {
        extensions: ['.js']
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            minimize: true
        })
    ]
};

module.exports = config;
