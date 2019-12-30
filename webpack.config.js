const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

const baseConfig = targetOptions => ({
  target: "web",
  entry: {
    index: "./lib/index.ts",
    "index.min": "./lib/index.ts"
  },
  output: {
    filename:
      targetOptions.libraryTarget === "umd"
        ? `./[name].js`
        : `./[name].${targetOptions.libraryTarget}.js`,
    library: "RecentSearches",
    ...targetOptions
  },
  mode: "production",
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ["babel-loader"]
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
    extensions: [".ts", ".js"]
  }
});

module.exports = [
  baseConfig({ libraryTarget: "umd" }),
  baseConfig({ libraryTarget: "var" })
];
