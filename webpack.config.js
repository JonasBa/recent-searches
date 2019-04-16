const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: {
    "index": './lib/index.ts',
    "index.min": './lib/index.ts'
  },
  output: {
    filename: "./[name].js",
    libraryExport: "default" ,
    libraryTarget: 'umd'
  },
  mode: 'development',
  devtool: 'source-map',
  module: {
    rules: [
      { 
        test: /\.ts$/,
        use: [
          "babel-loader"
        ]
      }
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [
      new UglifyJsPlugin({
        include: /\.min\.js$/,
        uglifyOptions: {
            output: {
            comments: false
          }
        }
      })
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  }
};