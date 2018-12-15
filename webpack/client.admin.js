const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const join = require('path').join;

module.exports = {
  mode: 'development',
  name: 'admin',
  entry: [join(__dirname, '../src/admin/client/index.js')],
  output: {
    filename: "admin.js",
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
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
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
  },
  plugins: [
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "admin.css",
      path: join(__dirname, '../dist'),
      chunkFilename: "[id].css"
    })
  ],
  devServer: {
    proxy: {
      '/admin': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:8080',
        pathRewrite: {'^/uploads' : '/admin/uploads/'},
        changeOrigin: true
      },
    }
  }
};