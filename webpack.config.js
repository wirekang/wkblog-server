/* eslint-disable */

const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const mode = process.env.NODE_ENV || 'development';

module.exports = {
  target:"node",
  mode,
  entry: path.join(__dirname, 'src', 'index.ts'),
  output: {
    filename: 'blog-back.js',
    path: path.join(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.js','.ts'],
    modules:[
      path.join(__dirname,"src"),
      'node_modules',
    ],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin.CleanWebpackPlugin(),
  ],

}