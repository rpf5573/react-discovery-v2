const path = require('path');
const template = require('./warehouse-client/template');

module.exports = (app, DCQuery) => {
  app.get('/admin/warehouse', async (req, res) => {
    var srcPath = {
      style: 'style.css',
      js: 'main.js'
    };

    // /admin이라고 하면 relative path가 localhost:8081/ 로 되버려서, style.css나 main.js파일을 읽어들일 수 없어
    if ( req.originalUrl == '/admin/warehouse' ) {
      srcPath.style = 'warehouse/style.css';
      srcPath.js = 'warehouse/main.js';
    }

    // 먼저 관리자로 로그인이 되어있는지 부터 확인해야지
    if ( req.session.loginData && req.session.loginData.role == 'admin' ) {
      let initialSettings = await DCQuery.getInitialState('warehouse');
      let document = template(initialSettings, srcPath);
      return res.set('Content-Type', 'text/html').end(document);
    } else {
      return res.redirect('/?message=' + encodeURIComponent('관리자 페이지에서 다시 접속해 주세요'));
    }
  });
  app.post('/admin/warehouse/post-info/update-or-insert', async (req, res) => {
    let result = await DCQuery.warehouse.update(req.body.postInfo);
    if ( result.err ) {
      return res.status(201).json({
        error: result.err
      });
    }
    return res.sendStatus(201);
  });
  app.post('/admin/warehouse/post-info/remove', async (req, res) => {
    let result = await DCQuery.warehouse.remove(req.body.post);
    if ( result.err ) {
      return res.status(201).json({
        error: result.err
      });
    }
    return res.sendStatus(201);
  });
}