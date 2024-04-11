const path = require("path");
const ForkTsCheckerNotifierWebpackPlugin = require("fork-ts-checker-notifier-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const { EsbuildPlugin } = require("esbuild-loader");

const isProdMode = process.env.PROD_BUILD === "true";

const config = {
  entry: {
    app: ["./ytdownloader/react_src/app.js"],
  },
  optimization: {
    usedExports: true,
    splitChunks: {
      chunks: "async",
      minSize: 20000,
      minRemainingSize: 0,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      enforceSizeThreshold: 50000,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          reuseExistingChunk: true,
          name: "vendors",
          chunks: 'all'
        },
      },
    },
    mangleExports: !isProdMode,
    minimizer: [
      new EsbuildPlugin({
        target: "es2015", // Syntax to compile to (see options below for possible values)
        format: "esm",
      }),
    ],
  },
  devtool: isProdMode ? false : "source-map",//"source-map", // isDevMode ? "source-map" : false,
  mode: "production",
  output: {
    path: path.resolve(__dirname, "ytdownloader/static/js/"), 
    filename: "[name].min.js",
    clean: true,
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: path.resolve(__dirname, "tsconfig.json"),
      },
    }),
    new ForkTsCheckerNotifierWebpackPlugin({
      title: "TypeScript",
      excludeWarnings: false,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: {
          loader: "babel-loader",
        },
        exclude: /node_modules/,
        include: path.join(__dirname, "ytdownloader/react_src"),
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
            },
          },
        ],
        exclude: /node_modules/,
        include: path.join(__dirname, "ytdownloader/react_src"),
      },
    ],
  },
  cache: {
    type: "filesystem",
  },
};

module.exports = config;
