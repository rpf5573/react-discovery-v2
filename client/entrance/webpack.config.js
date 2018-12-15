const HtmlWebPackPlugin = require("html-webpack-plugin");
const path = require("path");
const distPath = path.join(__dirname, "../../public/entrance/");

module.exports = {
  mode: 'development',
  entry: ["@babel/polyfill", "./app/index.js"],
  output: {
    filename: "entrance/[name].js",
    path: distPath
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
        test: /\.(css)$/,
        use: [ 'style-loader', 'css-loader' ]
      },
      { test: /\.(scss)$/, use: [
        {
          loader: "style-loader" // creates style nodes from JS strings
        },
        {
          loader: "css-loader" // translates CSS into CommonJS
        },
        {
          loader: "sass-loader" // compiles Sass to CSS
        }
      ]}
    ]
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "./app/index.html",
      filename: distPath+'/index.html'
    })
  ],
  devServer: {
    proxy: {
      '/entrance': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/admin': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
};