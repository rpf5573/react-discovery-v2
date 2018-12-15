module.exports = (app, path, multer, mysql) => {
  const DCQuery = new (require('../query'))(mysql);
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/admin/uploads/');
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
  require('./routes/adminRoute')(app, DCQuery, upload);
}