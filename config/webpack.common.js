let webpack = require('webpack');
let path = require('path');
let autoprefixer = require('autoprefixer');
let perfectionist = require('perfectionist');
let ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: {
        // 'app': './src/app.ts',
        // 'vendor': './src/vendor.ts',
        'draw': './src/draw/index.ts'
    },

    resolve: {
        extensions: ['', '.js', '.ts', '.css', '.scss', '.html']
    },

    module: {
        loaders: [
            {
                test: /\.ts$/,
                loader: 'awesome-typescript-loader',
                exclude: /node_modules/
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract('css!postcss!sass'),
                exclude: /node_modules/
            }
        ]
    },

    postcss: () => {
        return [autoprefixer({ browsers: ['Safari >= 8', 'last 2 versions'] }), perfectionist];
    },

    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery"
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: ['draw'].reverse()
        })
    ]
};