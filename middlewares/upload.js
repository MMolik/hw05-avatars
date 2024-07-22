const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tmpPath = path.join(__dirname, '../tmp'); // 
    fs.mkdir(tmpPath, { recursive: true })
      .then(() => cb(null, tmpPath))
      .catch(err => cb(err));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

module.exports = upload;
