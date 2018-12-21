const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const join = require('path').join;

module.exports = {
  mode: 'development',
  name: 'user',
  entry: ["@babel/polyfill", join(__dirname, '/index.js')],
  devtool: 'source-map',
  output: {
    filename: "main.js",
    path: join(__dirname, '../../../public/user/'),
    publicPath: '/user'
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
      filename: "style.css",
      path: join(__dirname, '../../../public/user/'),
      chunkFilename: "[id].css"
    })
  ],
  devServer: {
    proxy: {
      '/': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:8080',
        pathRewrite: {'^/uploads' : '/admin/uploads/'},
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://localhost:8080'
      }
    },
    historyApiFallback: true,
  }
};