const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
  entry: './app/index.js',
  output: {
    path: `${__dirname}/dist`,
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader'],
        }),
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader'],
        }),
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../app'),
      vue$: 'vue/dist/vue.esm.js',
    },
    extensions: ['*', '.js', '.vue', '.json'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
    }),
    new ExtractTextPlugin('styles.css'),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: 'static',
        ignore: ['.*'],
      },
    ]),
    new VueLoaderPlugin(),
  ],
};
