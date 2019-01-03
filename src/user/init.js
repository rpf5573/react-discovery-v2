const utils = require('../utils/server');
const fs = require('fs-extra');

module.exports = (app, path, multer, mysql) => {
  const DCQuery = new (require('../query'))(mysql);
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let team = (req.body.team ? req.body.team : req.session.loginData.team );
      let uploadPath = 'public/user/uploads/';
      if ( process.env.NODE_ENV == 'production' && process.env.DCV ) {
        uploadPath += process.env.DCV + '/' + req.body.team;
      }

      fs.ensureDir(uploadPath, err => {
        if ( err ) {
          console.log( 'err making dir: ', err );
        } else {
          cb(null, uploadPath);
        }
      });

    },
    filename: (req, file, cb) => {
      let date = utils.getYYYYMMDDHHMMSS();
      let filename = date + path.extname(file.originalname);
      console.log( 'filename : ', filename );
      cb(null, filename);
    }
  });
  const upload = multer({
    storage: storage,
    limits:{fileSize: 100000000} // about 100MB
  }).fields([{name: 'userFile', maxCount: 1}]);
  require('./routes/userRoute')(app, DCQuery, upload);
}