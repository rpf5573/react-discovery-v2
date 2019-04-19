const template = require('./user-client/template');
const utils = require('../utils/server');
const constants = require('../utils/constants');

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
      
      const fullUrl =  req.protocol + '://' + req.get('host');
      try {
        let initialSettings = await DCQuery.getInitialState('user');
        initialSettings.rootPath = fullUrl;
        initialSettings.loginData = req.session.loginData;
        let document = template(initialSettings, srcPath, process.env.DCV);
        return res.set('Content-Type', 'text/html').end(document);
      } catch (err) {
        console.error( 'err : ', err );
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

  app.post('/user/get-puzzle-colon-infos', async (req, res) => {
    let result = await DCQuery.puzzles.getAll(req.body.teamCount);
    return res.status(201).json(result);
  });

  app.post('/user/openBox', async (req, res) => {
    try {
      // 다른 팀이 이미 점령했는지 체크해야지
      var result = await DCQuery.puzzles.getAll(req.body.teamCount);
      for ( var i = 0; i < result.length; i++ ) {
        let boxNumbers = JSON.parse( result[i].boxNumbers );
        if ( Array.isArray(boxNumbers) ) {
          for ( var z = 0; z < boxNumbers.length; z++ ) {
            if ( boxNumbers[z] == req.body.boxNumber ) {
              return res.status(201).json({
                error: "이미 다른팀에의해 점령당했습니다"
              });
            }
          }
        }
      }

      // 돈 체크 합니다잉~
      result = await DCQuery.points.get('useable', req.body.team);
      if ( result[0].useable < req.body.boxOpenUse ) {
        return res.status(201).json({ error: '가용점수가 부족합니다' });
      }

      // 퍼즐 먼저 업데이트 하즈아 !
      await DCQuery.puzzles.update( req.body.team, req.body.boxNumber, req.body.type );
      console.log( `/user/openBox - after puzzles.update / team : ${req.body.team} / bingo : ${req.body.bingoPoint}` );

      // 포인트 업데이트
      await DCQuery.points.update({ 
        team: req.body.team, 
        useable: -(req.body.boxOpenUse),
        puzzle: req.body.puzzlePoint,
        bingo: req.body.bingoPoint
      });
      console.log( '/user/openBox - after puzzle update' );

      res.status(201).json({
        team: req.body.team,
        boxNumber: req.body.boxNumber
      });
    } catch (err) {
      console.error( 'err : ', err );
      return res.status(201).json({
        error: '데이터베이스 통신중 에러가 발생하였습니다'
      })
    }
  });

  app.get('/user/point-check', async (req, res) => {
    // 돈 체크 합니다잉~
    let result = await DCQuery.points.get('useable', req.body.team);
    if ( result[0].useable < req.body.boxOpenUse ) {
      return res.status(201).json({ error: '가용점수가 부족합니다' });
    }

    return res.sendStatus(201);
  });

  app.post('/user/eniac', async (req, res) => {
    try {
      // 1. eniac state check
      var result = await DCQuery.metas.get('eniacState');
      result = parseInt(result);
      if ( isNaN(result) || !result ) {
        return res.status(201).json({ error: '현재 문장해독이 불가능한 상태입니다' });
      }

      var result = await DCQuery.metas.get('eniacSuccessTeams');
      result = JSON.parse(result);
      if ( ! Array.isArray(result) ) {
        result = [];
      }
      var point = req.body.point; // 기본은 1등
      const rank = result.length + 1;

      if ( result.length > 0 ) {
        // 먼저 이미 맞춘 이력이 있는지 체크
        for ( var i = 0; i < result.length; i++ ) {
          if ( result[i] == req.body.team ) {
            return res.status(201).json({ error: '이미 맞추셨습니다' });
          }
        }

        // 등수에 맞게 포인트 지급
        switch( rank ) {
          case 2:
            point = point - 4000;
            break;
          case 3:
            point = point - 7000;
            break;
          case 4:
            point = point - 9000;
            break;
          case 5:
            point = point - 10000;
            break;
            
          // 6등부터는 같은 점수
          default:
            point = point - 11000;
            break;
        }
      }

      result.push(req.body.team);

      await DCQuery.points.update({ team: req.body.team, eniac: point });
      await DCQuery.metas.update('eniacSuccessTeams', JSON.stringify(result));

      res.status(201).json({
        point,
        rank
      });

    } catch (err) {
      console.error( 'err : ', err );
      return res.status(201).json({
        error: '데이터베이스 통신중 에러가 발생하였습니다'
      })
    }
  });

  app.post('/user/upload', async (req, res) => {
    upload(req, res, async (err) => {
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
            const team = req.body.team;
            console.log( `team : ${team} success upload !!` );
            const filename = req.files.userFile[0].filename;
            const point  = req.body.point;
            const currentTime = utils.getCurrentTimeInSeconds();
            await DCQuery.points.update({
              team,
              temp: point, // useable이 아니라 temp를 업데이트 한다,
            });
            await DCQuery.uploads.add(team, filename, currentTime, true);
            res.sendStatus(201); // 우선 보내고 그다음 할일을 하자. 아래꺼는 좀 오래걸리니까 !

            await DCQuery.uploads.addStackFile(team, filename);
          } catch (e) {
            console.log( 'e : ', e );
            res.sendStatus(401);
          }
        }
      }
    });
  });

  app.post('/user/timer-check', async (req, res) => {
    try {
      let result = await DCQuery.timers.check(req.body.team, req.body.laptime);
      if ( ! result.state ) {
        return res.status(201).json({
          error: "타이머 off상태입니다"
        });
      }

      if ( result.td <= 0 ) {
        return res.status(201).json({
          error: "타이머 시간을 초과하였습니다"
        });
      } 
    
      return res.sendStatus(201);

    } catch (e) {
      console.log( 'e : ', e );
      return res.sendStatus(404);
    }
  });

  app.post('/user/upload-interval-check', async (req, res) => {
    try {
      let result = await DCQuery.uploads.get(req.body.team);
      let currentTime = utils.getCurrentTimeInSeconds();
      let uploadTime = result[0].uploadTime;

      if ( (currentTime - uploadTime) < constants.UPLOAD_TIME_INTERVAL ) {
        return res.status(201).json({
          error: "연속적으로 업로드 할 수 없습니다. 잠시후 다시 시도해 주시기 바랍니다"
        });
      }
      return res.sendStatus(201);
    } catch (e) {
      console.log( 'e : ', e );
      return res.sendStatus(404);
    }
  });

  app.get('/user/open-lastbox', async (req, res) => {
    try {
      let result = await DCQuery.metas.get('lastBoxState');
      result = parseInt(result);
      if ( result ) {
        return res.sendStatus(201);
      } else {
        return res.status(201).json({
          error: "현재 해당 구역는 오픈할 수 없습니다"
        });
      }
    } catch (e) {
      console.error(e);
      return res.sendStatus(404);
    }
  });

}