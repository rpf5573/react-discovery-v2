const path = require('path');
const template = require('./assist-client/template');

module.exports = (app, DCQuery) => {

  app.get(['/assist', '/assist/page'], (req, res) => {
    return res.redirect('/assist/page/map');
  });

  app.get('/assist/page/*', async (req, res) => {
    // 먼저 유저로 로그인이 되어있는지 부터 확인해야지
    if ( req.session.loginData && req.session.loginData.role == 'assist' ) {
      var srcPath = {
        style: '../style.css',
        js: '../main.js'
      };
      // /assist이라고 하면 relative path가 localhost:8081/ 로 되버려서, style.css나 main.js파일을 읽어들일 수 없어
      if ( req.originalUrl == '/assist' ) {
        srcPath.style = 'assist/style.css';
        srcPath.js = 'assist/main.js';
      }
      
      try {
        let initialSettings = await DCQuery.getInitialState('assist');
        initialSettings.loginData = req.session.loginData;
        let document = template(initialSettings, srcPath, process.env.DCV);
        return res.set('Content-Type', 'text/html').end(document);
      } catch (err) {
        console.log( 'err : ', err );
        return res.sendStatus(404);
      }
    } else {
      return res.redirect('/?message=' + encodeURIComponent('접근 권한이 없습니다'));
    }
  });

}