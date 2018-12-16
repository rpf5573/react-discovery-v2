const join = require('path').join;
var nodeExternals = require('webpack-node-externals');

module.exports = {
  mode: 'development',
  name: 'server',
  target: 'node',
  externals: [nodeExternals()],
  devtool: 'source-map',
  entry: ['@babel/polyfill', join(__dirname, '../src/index')],
  output: {
    filename: "server.js",
    path: join(__dirname, '../dist'),
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader", // 알아서 babelrc.js 파일을 참고한다
          options: {
            modules: false
          }
        }
      },
      {
        test: /\.(scss|css)$/,
        use: [
          {
            loader: "css-loader/locals",
            options: {
              minimize: {
                safe: true
              }
            }
          },
          {
            loader: 'sass-loader',
            options: {}
          }
        ]
      }
    ]
  }
};