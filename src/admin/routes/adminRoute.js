const path = require('path');
const template = require('../admin-client/template');

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
    console.log( 'req.session : ', req.session );
    if ( req.session.loginData && req.session.loginData.role == 'admin' ) {
      let initialSettings = await DCQuery.getInitialState('admin');
      let document = template(initialSettings, srcPath);
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
  app.post('/admin/timer/team-timers', async (req, res) => {
    let result = await DCQuery.timer.updateState(req.body.team, req.body.newState, req.body.isAll);
    if ( result.err ) {
      return res.status(201).json({
        error: result.err
      });
    }
    let newTeamTimers = await DCQuery.timer.getAll();
    if ( newTeamTimers.err ) {
      return res.status(201).json({
        error: newTeamTimers.err
      });
    }

    res.status(201).json(newTeamTimers);
    return;
  });

  // puzzle settings
  app.post('/admin/puzzle-settings/puzzlebox-count', async (req, res) => {
    let result = await DCQuery.meta.update('puzzlebox_count', req.body.puzzleBoxCount);
    if ( result.err ) {
      return res.status(201).json({
        error: result.err
      });
    }
    res.sendStatus(201);
    return;
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

  // admin passwords
  app.post('/admin/admin-passwords/passwords', async (req, res) => {
    console.log( 'req.body.adminPasswords : ', req.body.adminPasswords );
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
  app.get('/admin/result', async (req, res) => {
    let rows = await DCQuery.resultData();
    return res.status(201).json(rows);
  });

  // reset
  app.post('/admin/reset', async (req, res) => {
    let pw = req.body.reset_password;
    if ( pw && pw == 'discovery_reset' ) {
      let result = await DCQuery.reset();
      if ( result.err ) {
        return res.status(201).json({
          error: result.err
        });
      }
      return res.sendStatus(201);
    }
  });

  // post info
  app.post('/admin/post-info/update-or-insert', async (req, res) => {
    let result = await DCQuery.postInfo.update(req.body.postInfo);
    if ( result.err ) {
      return res.status(201).json({
        error: result.err
      });
    }
    return res.sendStatus(201);
  });
  app.post('/admin/post-info/remove', async (req, res) => {
    let result = await DCQuery.postInfo.remove(req.body.post);
    if ( result.err ) {
      return res.status(201).json({
        error: result.err
      });
    }
    return res.sendStatus(201);
  })
}