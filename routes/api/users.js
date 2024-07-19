const express = require('express');
const router = express.Router();
const authenticate = require('../../middlewares/authenticate');
const upload = require('../../middlewares/upload');
const updateAvatar = require('../../controllers/updateAvatar');
const { signup } = require('../../controllers/signupController');
const { login } = require('../../controllers/loginController');

// Endpoint do aktualizacji avatara
router.patch('/avatars', authenticate, upload.single('avatar'), updateAvatar);

// Endpoint do rejestracji użytkownika
router.post('/signup', signup);

// Endpoint do logowania użytkownika
router.post('/login', login);

module.exports = router;
