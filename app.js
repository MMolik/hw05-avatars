const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const jimp = require('jimp');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const contactRoutes = require('./routes/api/contacts');
const userRoutes = require('./routes/api/users');
const User = require('./models/user');
const { isImageAndTransform } = require('./services/helper');

const app = express();

// Middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());
app.use('/avatars', express.static(path.join(__dirname, 'public/avatars')));

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tmpPath = path.join(__dirname, 'tmp'); // Temporary storage folder
    fs.mkdir(tmpPath, { recursive: true })
      .then(() => cb(null, tmpPath))
      .catch(err => {
        console.error('Error creating temporary directory:', err);
        cb(err);
      });
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Middleware for user authentication
const authenticate = require('./middlewares/authenticate');

app.patch('/api/users/avatars', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'File is required',
      });
    }

    if (!req.user || !req.user.id) {
      console.log('User is not authenticated or user ID is missing');
      return res.status(401).json({
        status: 'error',
        code: 401,
        message: 'User not authenticated',
      });
    }

    const { id } = req.user;
    const { path: temporaryPath, filename } = req.file;
    console.log(`Temporary file path: ${temporaryPath}`);

    const fileExtension = path.extname(filename);
    const newFileName = `${uuidv4()}${fileExtension}`;
    const newFilePath = path.join(__dirname, 'public/avatars', newFileName);

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
    if (!user) {
      await fs.unlink(temporaryPath);
      return res.status(404).json({
        status: 'error',
        code: 404,
        message: 'User not found',
      });
    }

    if (user.avatarURL) {
      const oldAvatarPath = path.join(__dirname, 'public', user.avatarURL);
      await fs.unlink(oldAvatarPath).catch((err) => console.error('Error deleting old avatar:', err));
    }

    const image = await jimp.read(temporaryPath);
    await image.resize(250, 250).write(newFilePath);

    const avatarURL = `/avatars/${newFileName}`;
    user.avatarURL = avatarURL;
    await user.save();

    return res.status(200).json({
      status: 'success',
      code: 200,
      data: {
        avatarURL,
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
});

app.use('/api/contacts', contactRoutes);
app.use('/api/users', userRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

const dbURI = process.env.MONGODB_URI;

mongoose
  .connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Database connection successful'))
  .catch((err) => {
    console.error('Database connection error:', err);
    process.exit(1);
  });

module.exports = app;
