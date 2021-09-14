const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {    
    cache: true,
    entry: {
        index: './src/index.js'
    },
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './dist'
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'ZED Race Picker',
        })
    ],
    optimization: {
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: function (module) {
                        var packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                        return packageName.replace('@', '');
                    }
                }
            }
        }
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true
    },
    module: {
        rules: [
            { test: /\.css$/i, use: ['css-loader'] },
            { test: /\.sass$/i, use: ['css-loader', 'sass-loader'] },
            { test: /\.scss$/i, use: ['css-loader', 'sass-loader'] }
        ]
    },
    resolve: {
        fallback: {
            "assert": false,
            "crypto": false,
            "http": false,
            "https": false,
            "os": false,
            "stream": false
        }
    }
};