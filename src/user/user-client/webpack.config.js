const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const join = require('path').join;

module.exports = {
  name: 'user',
  entry: [join(__dirname, '/index.js')],
  devtool: 'source-map',
  node: {
    fs: 'empty' // 가끔 에러가 나오더라고, 그래서 이거를 넣어줌 https://github.com/MrRio/jsPDF/issues/1764
  },
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
            loader: 'postcss-loader',
            options: {
                plugins: () => [require('autoprefixer')({
                    'browsers': ['> 10%', 'last 2 versions']
                })],
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
      '/socket.io/': {
        target: 'http://localhost:8080'
      }
    },
    historyApiFallback: true,
  }
};