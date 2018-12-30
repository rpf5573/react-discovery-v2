const utils = require('../utils/server');

module.exports = (app, path, multer, mysql) => {
  const DCQuery = new (require('../query'))(mysql);
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let team = (req.body.team ? req.body.team : req.session.loginData.team );
      cb(null, `public/user/uploads/${req.body.team}`);
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