const path = require('path');
const template = require('../client/template');

module.exports = (app, DCQuery, upload) => {

  app.get('/user', async (req, res) => {

    // 먼저 유저로 로그인이 되어있는지 부터 확인해야지
    if ( req.session.loginData && req.session.loginData.role == 'user' ) {
      var srcPath = {
        style: 'style.css',
        js: 'main.js'
      };
      // /admin이라고 하면 relative path가 localhost:8081/ 로 되버려서, style.css나 main.js파일을 읽어들일 수 없어
      if ( req.originalUrl == '/user' ) {
        srcPath.style = 'user/style.css';
        srcPath.js = 'user/main.js';
      }
  
      let initialSettings = await DCQuery.getInitialState('user');
      console.log( 'initialSettings : ', initialSettings );
      let document = template(initialSettings, srcPath);
      return res.set('Content-Type', 'text/html').end(document);
    } else {
      return res.redirect('/?message=' + encodeURIComponent('접근 권한이 없습니다'));
    }

  });

  app.get('/user/*', async (req, res) => {

    // 먼저 유저로 로그인이 되어있는지 부터 확인해야지
    if ( req.session.loginData && req.session.loginData.role == 'user' ) {
      var srcPath = {
        style: 'style.css',
        js: 'main.js'
      };
      // /admin이라고 하면 relative path가 localhost:8081/ 로 되버려서, style.css나 main.js파일을 읽어들일 수 없어
      if ( req.originalUrl == '/user' ) {
        srcPath.style = 'user/style.css';
        srcPath.js = 'user/main.js';
      }
  
      let initialSettings = await DCQuery.getInitialState('user');
      console.log( 'initialSettings : ', initialSettings );
      let document = template(initialSettings, srcPath);
      return res.set('Content-Type', 'text/html').end(document);
    } else {
      return res.redirect('/?message=' + encodeURIComponent('접근 권한이 없습니다'));
    }

  });
}