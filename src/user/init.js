const utils = require('../utils/server');
const fs = require('fs-extra');

module.exports = (app, path, multer, DCQuery) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let team = (req.body.team ? req.body.team : req.session.loginData.team );
      let uploadPath = `public/user/uploads/${process.env.DCV}/${team}`;
      
      fs.ensureDirSync(uploadPath);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      console.log('file in server', file);
      let date = utils.getYYYYMMDDHHMMSS();
      let filename = date + path.extname(file.originalname);
      cb(null, filename);
    }
  });
  const upload = multer({
    storage: storage,
    limits:{fileSize: 100000000} // about 100MB
  }).fields([{name: 'userFile', maxCount: 1}]);
  require('./userRoute')(app, DCQuery, upload);
}