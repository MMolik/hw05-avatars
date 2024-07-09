const express = require('express');
const router = express.Router();
const signupController = require('../../controllers/signupController');
const loginController = require('../../controllers/loginController');
const logoutController = require('../../controllers/logoutController');
const currentUserController = require('../../controllers/currentUserController');
const authenticate = require('../../middlewares/authenticate');

// Rejestracja
router.post('/signup', signupController.signup);

// Logowanie
router.post('/login', loginController.login);

// Wylogowanie
router.get('/logout', authenticate, logoutController.logout);

// Obecny użytkownik
router.get('/current', authenticate, currentUserController.getCurrent);

module.exports = router;
