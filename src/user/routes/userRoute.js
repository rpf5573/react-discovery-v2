const path = require('path');
const template = require('../user-client/template');

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
      let document = template(initialSettings, srcPath);
      return res.set('Content-Type', 'text/html').end(document);
    } else {
      return res.redirect('/?message=' + encodeURIComponent('접근 권한이 없습니다'));
    }

  });

  app.get('/user/get-updated-points', async (req, res) => {
    let result = await DCQuery.points.get('useable');
    return res.status(201).json(result);
  });

  app.get('/user/get-puzzle-colon-info', async (req, res) => {
    let result = await DCQuery.puzzle.getAll();
    return res.status(201).json(result);
  });

  app.post('/user/openBox', async (req, res) => {
    try {
      await DCQuery.puzzle.update( req.body.team, req.body.boxNumber );
      await DCQuery.points.updateOneRow({ team: req.body.team, puzzle: req.body.point });
      res.sendStatus(201);
    } catch (err) {
      console.log( 'err : ', err );
      return res.status(201).json({
        error: '데이터베이스 통신중 에러가 발생하였습니다'
      })
    } 
  });

  app.get('/user/*', async (req, res) => {

    // 먼저 유저로 로그인이 되어있는지 부터 확인해야지
    if ( req.session.loginData && req.session.loginData.role == 'user' && req.session.loginData.team > 0) {
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
      initialSettings.loginData = req.session.loginData;
      let document = template(initialSettings, srcPath);
      return res.set('Content-Type', 'text/html').end(document);
    } else {
      return res.redirect('/?message=' + encodeURIComponent('접근 권한이 없습니다'));
    }

  });
}