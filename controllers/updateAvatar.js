const fs = require('fs').promises;
const path = require('path');
const jimp = require('jimp');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/user');
const { isImageAndTransform } = require('../services/helper');

const updateAvatar = async (req, res) => {
  try {
    console.log('Request user:', req.user); // Debugging log
    console.log('Uploaded file:', req.file); // Debugging log

    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'File is required',
      });
    }

    const { id } = req.user;
    console.log('User ID:', id); // Debugging log
    if (!id) {
      console.log('User ID is not available');
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'User ID is not available',
      });
    }

    const { path: temporaryPath, filename } = req.file;
    console.log(`Temporary file path: ${temporaryPath}`);

    const fileExtension = path.extname(filename);
    const newFileName = `${uuidv4()}${fileExtension}`;
    const newFilePath = path.join(__dirname, '../public/avatars', newFileName);

    console.log(`New file path: ${newFilePath}`);

    const isImageValid = await isImageAndTransform(temporaryPath);
    console.log(`Is image valid: ${isImageValid}`);

    if (!isImageValid) {
      await fs.unlink(temporaryPath);
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Invalid image file',
      });
    }

    const user = await User.findById(id);
    console.log('User found:', user);

    if (!user) {
      await fs.unlink(temporaryPath);
      return res.status(404).json({
        status: 'error',
        code: 404,
        message: 'User not found',
      });
    }

    if (user.avatarURL) {
      const oldAvatarPath = path.join(__dirname, '../public', user.avatarURL);
      console.log('Deleting old avatar at:', oldAvatarPath);
      await fs.unlink(oldAvatarPath).catch(err => console.error('Error deleting old avatar:', err));
    }

    const image = await jimp.read(temporaryPath);
    await image.resize(250, 250).write(newFilePath);

    user.avatarURL = `/avatars/${newFileName}`;
    await user.save();

    return res.status(200).json({
      status: 'success',
      code: 200,
      data: {
        avatarURL: user.avatarURL,
      },
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: error.message,
    });
  }
};

module.exports = updateAvatar;
