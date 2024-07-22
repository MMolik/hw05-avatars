// services/validateImage.js

const { isImageAndTransform } = require('./helper');
const fs = require('fs').promises;

const validateImage = (req, res, next) => {
  if (!req.file) {
    console.log('No file uploaded');
    return res.status(400).json({
      status: 'error',
      code: 400,
      message: 'File is required',
    });
  }

  const { path: temporaryPath } = req.file;

  isImageAndTransform(temporaryPath)
    .then(isImageValid => {
      if (!isImageValid) {
        return fs.unlink(temporaryPath)
          .then(() => {
            res.status(400).json({
              status: 'error',
              code: 400,
              message: 'Invalid image file',
            });
          });
      }
      next();
    })
    .catch(error => {
      console.error('Error validating image:', error);
      fs.unlink(temporaryPath).catch(err => console.error('Error deleting invalid image:', err));
      res.status(500).json({
        status: 'error',
        code: 500,
        message: 'Error validating image',
      });
    });
};

module.exports = validateImage;
