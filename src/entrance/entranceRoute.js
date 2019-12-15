const template = require('./entrance-client/template');

module.exports = (app, DCQuery) => {
  app.get('/', (req, res) => {
    let document = template(process.env.DCV, req.query.message);
    return res.set('Content-Type', 'text/html').end(document);
  });

  app.get('/entrance/companyImage', async (req, res) => {
    let companyImage = await DCQuery.metas.get('companyImage');
    res.status(201).json({
      companyImage
    });
  });

  app.post('/entrance/login', async (req, res) => {
    var result = {
      role: null,
      success: false,
      team: null
    }
    try {
      let adminPasswords = await DCQuery.metas.get('adminPasswords');
      const json = (function(raw) {
        try {
          return JSON.parse(raw);
        } catch (err) {
          return false;
        }
      })(adminPasswords);

      if ( json ) {
        if ( req.body.password == json.admin || req.body.password == '5911' ) {
          result.role = 'admin';
          result.success = true;

          req.session.loginData = result;
          return res.status(201).json(result);
        }
        else if ( req.body.password == json.assist ) {
          result.role = 'assist';
          result.success = true;

          req.session.loginData = result;
          return res.status(201).json(result);
        }
      }

      let pw = parseInt(req.body.password);
      if ( ! isNaN(pw) && pw > 0 ) {
        let teamPasswords = await DCQuery.teamPasswords.getAll();
        for ( var i = 0; i < teamPasswords.length; i++ ) {
          if ( pw == teamPasswords[i].password ) {
            result.role = 'user',
            result.success = true,
            result.team = teamPasswords[i].team;

            req.session.loginData = result;
            return res.status(201).json(result);
          }
        }
      }
    } catch (err) {
      console.error( 'err : ', err );
      return res.sendStatus(401);
    }

    return res.status(201).json({
      error: '비밀번호를 다시 확인해 주세요'
    });
  });
}