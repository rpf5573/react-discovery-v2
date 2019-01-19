const template = require('./media-files-client/template');

module.exports = (app, DCQuery) => {
  app.get('/media-files', async (req, res) => {
    var srcPath = {
      style: 'style.css',
      js: 'main.js'
    };

    // /admin이라고 하면 relative path가 localhost:8081/ 로 되버려서, style.css나 main.js파일을 읽어들일 수 없어
    if ( req.originalUrl == '/media-files' ) {
      srcPath.style = 'media-files/style.css';
      srcPath.js = 'media-files/main.js';
    }

    // 먼저 관리자로 로그인이 되어있는지 부터 확인해야지
    if ( req.session.loginData && req.session.loginData.role == 'admin' ) {
      try {
        let initialSettings = await DCQuery.uploads.getAllStackFiles();
        let document = template(initialSettings, srcPath, process.env.DCV);
        return res.set('Content-Type', 'text/html').end(document);
      } catch(e) {
        return res.redirect('/?message=' + encodeURIComponent('알수없는 에러가 발생하였습니다'));
      }
    } else {
      return res.redirect('/?message=' + encodeURIComponent('관리자 페이지에서 다시 접속해 주세요'));
    }
  });
  app.post('/media-files/make-stack-file-downloaded', async (req, res) => {
    const team = req.body.team;
    const filename = req.body.filename;
    try {
      let result = await DCQuery.uploads.makeStackFileDownloaded(team, filename);
      if ( result.err ) {
        return res.status(201).json({
          error: result.err
        });
      }
      return res.sendStatus(201);
    } catch(e) {
      console.log( 'e : ', e );
      return res.sendStatus(401);
    } 
  })
}