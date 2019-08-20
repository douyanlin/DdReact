const path = require('path');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  devServer: {
    historyApiFallback: {
      rewrites: [
        { from: /.*/, to: '/'},
      ],
      hot: true,
    }
  },
  module:{
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      }
    ]
  },
  plugins:[ //插件配置
    new HtmlWebPackPlugin({
      template: path.resolve(__dirname, 'public', 'index.html'),
      chunksSortMode: 'none',
      inject: true,
      compile: true,
      env:  process.env.ENV,
      minify: {
        removeAttributeQuotes: true,
        removeComments: true,
        minifyCSS: true,
        minifyJS: true,
      },
    }),
    new MiniCssExtractPlugin({
      filename: "style/[name].[contenthash].css",
      chunkFilename: "[id].[contenthash].css"
    })
  ]
};