const path = require('path');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const webpack = require('webpack')

module.exports = {
  entry: './src/index.tsx',
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
		new NodePolyfillPlugin()
	],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [{
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.webpack.json',
          },
        }],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    // fallback: {
    //   stream: require.resolve('stream-browserify'),
    //   "readable-stream": require.resolve('stream-browserify'),
    //   buffer: require.resolve('buffer/'),
    // },
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'test-dist'),
  },
};
