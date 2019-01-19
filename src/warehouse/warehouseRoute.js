const template = require('./warehouse-client/template');

module.exports = (app, WHQuery) => {
  app.get('/warehouse', async (req, res) => {
    var srcPath = {
      style: 'style.css',
      js: 'main.js'
    };

    // /admin이라고 하면 relative path가 localhost:8081/ 로 되버려서, style.css나 main.js파일을 읽어들일 수 없어
    if ( req.originalUrl == '/warehouse' ) {
      srcPath.style = 'warehouse/style.css';
      srcPath.js = 'warehouse/main.js';
    }

    // 먼저 관리자로 로그인이 되어있는지 부터 확인해야지
    if ( req.session.loginData && req.session.loginData.role == 'admin' ) {
      try {
        let initialSettings = await WHQuery.getInitialState();
        let document = template(initialSettings, srcPath);
        return res.set('Content-Type', 'text/html').end(document);
      } catch(e) {
        console.log( 'e : ', e );
        return res.redirect('/?message=' + encodeURIComponent('알수없는 에러가 발생하였습니다'));
      }
    } else {
      return res.redirect('/?message=' + encodeURIComponent('관리자 페이지에서 다시 접속해 주세요'));
    }
  });
  app.post('/warehouse/post-infos/add', async (req, res) => {
    try {
      let result = await WHQuery.insert(req.body.postInfo);
      return res.status(201).json({
        id: result.insertId
      });
    } catch(e) {
      console.log( 'e : ', e );
      return res.sendStatus(401);
    }
  });
  app.post('/warehouse/post-infos/edit', async (req, res) => {
    try {
      await WHQuery.update(req.body.postInfo);
      return res.sendStatus(201);
    } catch(e) {
      console.log( 'e : ', e );
      return res.sendStatus(401);
    }
  });
  app.post('/warehouse/post-infos/remove', async (req, res) => {
    try {
      await WHQuery.remove(req.body.id);
      return res.sendStatus(201);
    } catch(e) {
      console.log( 'e : ', e );
      return res.sendStatus(401);
    }
  });
}