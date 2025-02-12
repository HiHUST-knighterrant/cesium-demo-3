const path = require('path')
const WebpackBar = require('webpackbar')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: "development",
  // entry: "./webgis-src/app.js",
  entry: "./app-case.js",
  output: {
    filename: "build.js",
    path: path.join(__dirname, "./dist")
  },
  devtool: "source-map",
  module: "commonjs",
  devServer: {
    port: 9999,
    open: false,
    compress: false,
    contentBase: path.join(__dirname, "./")
  },
  plugins: [
    new WebpackBar(),
    new HtmlWebpackPlugin({
      title: "hello",
      filename: "index.html",
      template: "./index.html",
      inject: true
    })
  ],
  module: {
    unknownContextCritical: /^.\/.*$/,
    unknownContextCritical: false,
    rules: [
      {
        test: /\.glsl$/,
        loader: 'webpack-glsl-loader'
      },
    ]
  }
}
