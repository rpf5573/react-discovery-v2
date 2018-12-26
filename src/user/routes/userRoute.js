const path = require('path');
const template = require('../user-client/template');

module.exports = (app, DCQuery, upload) => {

  app.get(['/user', '/user/page'], (req, res) => {
    return res.redirect('/user/page/map');
  });

  app.get('/user/page/*', async (req, res) => {
    // 먼저 유저로 로그인이 되어있는지 부터 확인해야지
    if ( req.session.loginData && req.session.loginData.role == 'user' ) {
      var srcPath = {
        style: '../style.css',
        js: '../main.js'
      };
      // /admin이라고 하면 relative path가 localhost:8081/ 로 되버려서, style.css나 main.js파일을 읽어들일 수 없어
      if ( req.originalUrl == '/user' ) {
        srcPath.style = 'user/style.css';
        srcPath.js = 'user/main.js';
      }
      
      try {
        let initialSettings = await DCQuery.getInitialState('user');
        initialSettings.rootPath = 'http://localhost:8080';
        initialSettings.loginData = req.session.loginData;
        let document = template(initialSettings, srcPath);
        return res.set('Content-Type', 'text/html').end(document);
      } catch (err) {
        console.log( 'err : ', err );
        return res.sendStatus(404);
      }
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
      // 돈먼저 체크 합니다잉~
      var result = await DCQuery.points.get('useable', req.body.team);

      if ( result[0].useable < req.body.boxOpenUse ) {
        return res.status(201).json({ error: '포인트가 부족합니다' });
      }

      await DCQuery.points.updateOneRow({ team: req.body.team, useable: -(req.body.boxOpenUse) });
      await DCQuery.points.updateOneRow({ team: req.body.team, puzzle: req.body.point });
      await DCQuery.puzzle.update( req.body.team, req.body.boxNumber );
      res.status(201).json({
        team: req.body.team,
        boxNumber: req.body.boxNumber
      });
    } catch (err) {
      console.log( 'err : ', err );
      return res.status(201).json({
        error: '데이터베이스 통신중 에러가 발생하였습니다'
      })
    }
  });

  app.post('/user/eniac', async (req, res) => {
    try {
      // 1. eniac state check
      var result = await DCQuery.meta.get('eniac_state');
      result = parseInt(result);
      if ( isNaN(result) || !result ) {
        return res.status(201).json({ error: '현재 암호해독이 불가능한 상태입니다' });
      }

      var result = await DCQuery.meta.get('eniac_success_teams');
      result = JSON.parse(result);
      if ( ! Array.isArray(result) ) {
        result = [];
      }
      var point = req.body.point; // 기본은 1등
      if ( result.length > 0 ) {
        // 먼저 이미 맞춘 이력이 있는지 체크
        for ( var i = 0; i < result.length; i++ ) {
          if ( result[i] == req.body.team ) {
            return res.status(201).json({ error: '이미 맞추셨습니다' });
          }
        }

        switch( result.length ) {
          case 1:
            point = Math.floor( (point * 0.9) * 0.01 ) * 100;
            break;
          case 2:
            point = Math.floor( (point * 0.8) * 0.01 ) * 100;
            break;
          case 3:
            point = Math.floor( (point * 0.7) * 0.01 ) * 100;
            break;
          case 4:
            point = Math.floor( (point * 0.6) * 0.01 ) * 100;
            break;
          case 5:
            point = Math.floor( (point * 0.5) * 0.01 ) * 100;
            break;
        }
      }

      result.push(req.body.team);

      await DCQuery.points.updateOneRow({ team: req.body.team, eniac: point });
      await DCQuery.meta.update('eniac_success_teams', JSON.stringify(result));

      res.status(201).json({
        point
      });

    } catch (err) {
      console.log( 'err : ', err );
      return res.status(201).json({
        error: '데이터베이스 통신중 에러가 발생하였습니다'
      })
    }
  });

  app.post('/user/upload', async (req, res) => {
    upload(req, res, (err) => {
      if ( err ) {
        console.log( 'upload err : ', err );
        res.status(201).json({
          error: err
        });
      } else {
        if ( req.files == undefined || ( req.files && req.files.userFile == undefined ) ) {
          res.status(201).json({
            error: '파일이 없습니다'
          });
        } else {
          try {
            console.log( 'req.body.point : ', req.body.point );
            DCQuery.points.updateOneRow({
              team: req.body.team,
              useable: req.body.point
            });
            DCQuery.uploads.update(req.body.team, req.files.userFile[0].filename);
            res.sendStatus(201);
          } catch (e) {
            console.log( 'e : ', e );
            res.sendStatus(401);
          }
        }
      }
    });
  });
}