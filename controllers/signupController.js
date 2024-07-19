const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Joi = require('joi');
const gravatar = require('gravatar');

// Walidacja danych wejściowych przy rejestracji
const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  username: Joi.string().alphanum().min(3).max(30).required(), // Dodaj pole username
});

// Obsługa endpointu rejestracji
exports.signup = async (req, res) => {
  try {
    // Sprawdzenie poprawności danych wejściowych
    const { error } = signupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Sprawdzenie, czy użytkownik o podanym emailu już istnieje
    let existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    // Generowanie avatarURL za pomocą Gravatara
    const avatarURL = gravatar.url(req.body.email, { s: '200', d: 'retro' }, true);

    // Możesz również dodać sprawdzenie czy avatarURL jest prawidłowy
    if (!avatarURL.startsWith('http')) {
      throw new Error('Gravatar URL is invalid');
    }

    // Hashowanie hasła
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Tworzenie nowego użytkownika
    const newUser = new User({
      email: req.body.email,
      password: hashedPassword,
      username: req.body.username, // Dodaj username do obiektu newUser
      avatarURL: avatarURL,
      subscription: 'starter', // Domyślnie ustawiamy subskrypcję
    });

    // Zapis użytkownika w bazie danych
    await newUser.save();

    // Odpowiedź sukcesu
    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
        avatarURL: newUser.avatarURL,
        username: newUser.username, // Dodaj username do odpowiedzi
      },
    });
  } catch (err) {
    // Obsługa błędów serwera
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
