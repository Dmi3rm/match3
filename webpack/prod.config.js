const baseConfig = require("./base.config.js");
const merge = require("webpack-merge");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = merge(baseConfig, {
  mode: "production",
  devtool: '',
  plugins: [
    new CleanWebpackPlugin(["dist"]),
    new UglifyJSPlugin({
      sourceMap: false,
    })
  ]
});
