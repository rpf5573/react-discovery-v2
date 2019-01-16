const path = require('path');
const template = require('./admin-client/template');
const utils = require('../utils/server');
const fs = require('fs-extra');

module.exports = (app, DCQuery, upload) => {
  app.get('/admin', async (req, res) => {
    var srcPath = {
      style: 'style.css',
      js: 'main.js'
    };
    // /admin이라고 하면 relative path가 localhost:8081/ 로 되버려서, style.css나 main.js파일을 읽어들일 수 없어
    if ( req.originalUrl == '/admin' ) {
      srcPath.style = 'admin/style.css';
      srcPath.js = 'admin/main.js';
    }

    // 먼저 관리자로 로그인이 되어있는지 부터 확인해야지
    if ( req.session.loginData && req.session.loginData.role == 'admin' ) {
      let initialSettings = await DCQuery.getInitialState('admin');
      let document = template(initialSettings, srcPath, process.env.DCV);
      return res.set('Content-Type', 'text/html').end(document);
    } else {
      return res.redirect('/?message=' + encodeURIComponent('접근 권한이 없습니다'));
    }
  });

  app.get('/admin/state', async (req, res) => {
    let initialState = await DCQuery.getInitialState();
    return res.json(initialState);
  });

  app.post('/admin/upload', async (req, res) => {
    upload(req, res, (err) => {
      if ( err ) {
        console.log( 'upload err : ', err );
        res.status(201).send(err);
      } else {
        if ( req.files == undefined ) {
          res.status(201).json({
            error: '파일이 없습니다'
          });
        } else {
          if ( req.files.companyImage !== undefined ) {
            DCQuery.meta.update('company_image', req.files.companyImage[0].originalname);
          }
          if ( req.files.map !== undefined ) {
            DCQuery.meta.update('map', req.files.map[0].originalname);
          }
          res.sendStatus(201);
        }
      }
    });
  });

  app.post('/admin/team-setting/passwords', async (req, res) => {
    let teamPasswords = req.body.teamPasswords;
    if ( teamPasswords.length > 0 ) {
      let result = await DCQuery.teamPasswords.update(teamPasswords);
      if ( result.err ) {
        console.log( 'result.err : ', result.err );
        return res.status(201).json({
          error: result.err
        });
      }
      let newTeamPasswords = await DCQuery.teamPasswords.getAll();
      res.status(201).json(newTeamPasswords);
      return;
    }
    res.status(201).json({
      error: '팀 패스워드가 입력되지 않았습니다'
    });
    return;
  });

  // timer
  app.post('/admin/timer/laptime', async (req, res) => {
    let result = await DCQuery.meta.update('laptime', req.body.laptime);
    if ( result.err ) {
      return res.status(201).json({
        error: result.err
      });
    }
    res.sendStatus(201);
    return;
  });
  app.post('/admin/timer/update-team-timers', async (req, res) => {
    try {
      var td = 0;
      // 만약에 타이머를 끄는거라면, 시간에 맞게 포인트를 주거나 빼야지
      // 다행이도 끄는거는 한번에 끄는게 없다 !
      if ( req.body.newState == 0 ) {
        let result = await DCQuery.timer.get(req.body.team);
        const startTime = result[0].startTime;
        const currentTime = utils.getCurrentTimeInSeconds();
        td = req.body.laptime - ( currentTime - startTime );
        var point = Math.floor(td/30) * ( td > 0 ? req.body.mappingPoints.timer_plus : req.body.mappingPoints.timer_minus );
        await DCQuery.points.updateOneRow({team: req.body.team, timer: point});

        // move temp to original
        if ( td >= 0 ) {
          await DCQuery.uploads.move(req.body.team);
          await DCQuery.points.move(req.body.team);
        } else {
          await DCQuery.uploads.reset('temp', req.body.team);
          await DCQuery.points.reset('temp', req.body.team);
        }
      }
      
      await DCQuery.timer.updateState(req.body.team, req.body.newState, td, req.body.isAll);
      let newTeamTimers = await DCQuery.timer.getAll();
      return res.status(201).json(newTeamTimers);
    } catch (e) {
      console.log( 'e : ', e );
      return res.sendStatus(401);
    }
  });
  app.post('/admin/timer/eniac-state', async (req, res) => {
    try {
      await DCQuery.meta.update('eniac_state', req.body.eniacState);
      return res.sendStatus(201);
    } catch (e) {
      console.log( 'error : ', e );
      return res.sendStatus(404);
    }
  });
  app.post('/admin/timer/get-team-timers', async (req, res) => {
    try {
      let teamTimers = await DCQuery.timer.getAll(req.body.teamCount);
      return res.status(201).json(teamTimers);
    } catch (e) {
      console.log( 'e : ', e );
      return res.sendStatus(401);
    }
  });

  // puzzle settings
  app.post('/admin/puzzle-settings/puzzlebox-count', async (req, res) => {
    try {
      await DCQuery.meta.update('puzzlebox_count', req.body.puzzleBoxCount);
      // reset eniac words
      await DCQuery.meta.update('original_eniac_words', null);
      await DCQuery.meta.update('random_eniac_words', null);
      return res.sendStatus(201);
    } catch (e) {
      return res.status(201).json({
        error: e
      });
    }
  });
  app.post('/admin/puzzle-settings/eniac-words', async (req, res) => {
    var result = await DCQuery.meta.update('original_eniac_words', req.body.originalEniacWords);
    if ( result.err ) {
      return res.status(201).json({
        error: result.err
      });
    }
    var result = await DCQuery.meta.update('random_eniac_words', req.body.randomEniacWords);
    if ( result.err ) {
      return res.status(201).json({
        error: result.err
      });
    }
    res.sendStatus(201);
    return;
  });
  app.post('/admin/puzzle-settings/lastbox-google-drive-url', async (req, res) => {
    let result = await DCQuery.meta.update('lastbox_google_drive_url', req.body.lastBoxGoogleDriveUrl);
    if ( result.err ) {
      return res.status(201).json({
        error: result.err
      });
    }
    res.sendStatus(201);
    return;
  });
  app.post('/admin/puzzle-settings/lastbox-state', async (req, res) => {
    let result = await DCQuery.meta.update('lastbox_state', req.body.lastBoxState);
    if ( result.err ) {
      return res.status(201).json({
        error: result.err
      });
    }
    res.sendStatus(201);
    return;
  });

  // points
  app.post('/admin/point-reward/points', async (req, res) => {
    let result = await DCQuery.points.reward(req.body.points);
    if ( result.err ) {
      return res.status(201).json({
        error: result.err
      });
    }
    return res.sendStatus(201);
  });
  app.post('/admin/point-reward/upload', async (req, res) => {
    try {
      // update point
      await DCQuery.points.updateOneRow({
        team: req.body.team,
        useable: req.body.point
      });

      // remove the filename from files array
      await DCQuery.uploads.remove(req.body.team, req.body.filename);

      res.sendStatus(201);
    } catch (e) {
      console.log( 'e : ', e );
      res.status(201).json({
        error: e
      });
    }
  });

  // admin passwords
  app.post('/admin/admin-passwords/passwords', async (req, res) => {
    let result = await DCQuery.meta.update('admin_passwords', JSON.stringify(req.body.adminPasswords));
    if ( result.err ) {
      return res.status(201).json({
        error: result.err
      });
    }
    return res.sendStatus(201);
  });

  // mapping points
  app.post('/admin/mapping-points', async (req, res) => {
    let json = await DCQuery.meta.get('mapping_points');
    let mappingPoints = JSON.parse(json);
    let newMappingPoints = Object.assign(mappingPoints, req.body.mapping_point);
    let result = await DCQuery.meta.update('mapping_points', JSON.stringify(newMappingPoints));
    if ( result.err ) {
      return res.status(201).json({
        error: result.err
      });
    }
    return res.sendStatus(201);
  });

  // result data
  app.post('/admin/result', async (req, res) => {
    try {
      let rows = await DCQuery.resultData(req.body.teamCount, req.body.puzzleBoxCount);
      return res.status(201).json(rows);
    } catch (e) {
      console.log( 'e : ', e );
      return res.sendStatus(401);
    }
  });

  // reset
  app.post('/admin/reset', async (req, res) => {
    let pw = req.body.reset_password;
    if ( pw && pw == 'discovery_reset' ) {
      try {
        await DCQuery.reset(); // DB reset
        await fs.remove( path.resolve( __dirname, `../../public/admin/uploads/${process.env.DCV}`) ); // admin uploads reset
        await fs.remove( path.resolve( __dirname, `../../public/user/uploads/${process.env.DCV}`) ); // user uploads reset
        return res.sendStatus(201);
      } catch(e) {
        return res.sendStatus(401);
      }
    }

    return res.status(201).json({
      error: '잘못된 접근입니다'
    });
  });

  // post info
  app.post('/admin/post-info/add', async (req, res) => {
    try {
      await DCQuery.postInfo.insert(req.body.postInfo);
      return res.sendStatus(201);
    } catch (e){
      console.error(e);
      return res.sendStatus(401);
    }
  });
  app.post('/admin/post-info/edit', async (req, res) => {
    try {
      await DCQuery.postInfo.remove(req.body.postInfo.originalPost);
      await DCQuery.postInfo.insert(req.body.postInfo);
      return res.sendStatus(201);
    } catch(e) {
      return res.sendStatus(401);
    }
  });
  app.post('/admin/post-info/remove', async (req, res) => {
    let result = await DCQuery.postInfo.remove(req.body.post);
    if ( result.err ) {
      return res.status(201).json({
        error: result.err
      });
    }
    return res.sendStatus(201);
  });

  // load files
  app.post('/admin/load-upload-infos', async (req, res) => {
    try {
      let allNull = true;
      let result = await DCQuery.uploads.getAll(req.body.teamCount);
      for ( var i = 0; i < req.body.teamCount; i++ ) {
        if ( result[i].files ) {
          allNull = false;
          break;
        }
      }
      if ( allNull ) {
        res.status(201).json({
          error: '올라온 자료가 없거나, 타이머를 종료하지 않았습니다'
        });
      } else {
        res.status(201).json({
          uploadInfos: result
        });
      }
    } catch(e) {
      console.log(e);
      return res.sendStatus(404);
    }
  }); 
  app.post('/admin/zip-path', async (req, res) => {
    const team = req.body.team;
    try {
      let folder = path.resolve( __dirname, `../../public/user/uploads/${process.env.DCV}/${team}`);
      let output = path.resolve( __dirname, `../../public/user/uploads/${process.env.DCV}/${team}.zip`);
      await utils.archive.zip(folder, output);
      res.status(201).json({
        zipPath: `/user/uploads/${process.env.DCV}/${team}.zip`
      })
    } catch(e) {
      console.log( 'e : ', e.code );
      if ( e.code == 'ENOENT' ) {
        return res.status(201).json({
          error: '아직 업로드 자료가 없습니다'
        });
      }
      res.sendStatus(401);
    }
  });
}