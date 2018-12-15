const join = require('path').join;

module.exports = {
  mode: 'development',
  name: 'server',
  target: 'node',
  devtool: 'source-map',
  entry: [join(__dirname, '../src/index')],
  output: {
    filename: "server.js",
    path: join(__dirname, '../dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader" // 알아서 babelrc.js 파일을 참고한다
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