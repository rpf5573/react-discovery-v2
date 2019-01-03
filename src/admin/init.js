var mkdirp = require('mkdirp');

module.exports = (app, path, multer, mysql) => {
  const DCQuery = new (require('../query'))(mysql);
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      mkdirp('public/admin/uploads/', function (err) {
        if (err) console.error(err)
        else cb(null, 'public/admin/uploads/');
      });
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    }
  });
  const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      const fileTypes = /jpeg|jpg|png|gif/;
      const extname = fileTypes.test(
        path.extname(file.originalname).toLowerCase()
      );
      const mimetype = fileTypes.test(file.mimetype);
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb('Error : Images only !');
      }
    }
  }).fields([{name: 'companyImage', maxCount: 1}, {name: 'map', maxCount: 1}]);
  require('./adminRoute')(app, DCQuery, upload);
}