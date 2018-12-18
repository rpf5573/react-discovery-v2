const fileExtensions = require('./client/file-extensions');

module.exports = (app, path, multer, mysql) => {
  const DCQuery = new (require('../query'))(mysql);
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/user/uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    }
  });
  const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      const fileTypes = fileExtensions.video.concat(fileExtensions.image);
      console.log( 'fileTypes : ', fileTypes );
      const ext = path.extname(file.originalname).toLowerCase();
      var fileExtensionOK = false;
      for ( var i = 0; i < fileTypes.length; i++ ) {
        if ( ext == fileTypes[i] ) {
          fileExtensionOK = true;
        }
      }
      if ( fileExtensionOK ) {
        return cb(null, true);
      } else {
        cb('Error : 지원하지 않는 파일 타입입니다');
      }
    }
  }).fields([{name: 'empty_test', maxCount: 1}, {name: 'emtpy_test_2', maxCount: 1}]);
  require('./routes/userRoute')(app, DCQuery, upload);
}