const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Joi = require('joi');

// Walidacja danych wejściowych przy rejestracji
const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
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
      return res.status(409).json({ message: 'Email in use' });
    }

    // Hashowanie hasła
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Tworzenie nowego użytkownika
    const newUser = new User({
      email: req.body.email,
      password: hashedPassword,
      subscription: 'starter', // Domyślnie ustawiamy subskrypcję
    });

    // Zapis użytkownika w bazie danych
    await newUser.save();

    // Odpowiedź sukcesu
    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
      },
    });
  } catch (err) {
    // Obsługa błędów serwera
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
