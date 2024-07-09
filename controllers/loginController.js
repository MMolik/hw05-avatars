const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Joi = require('joi');

// Walidacja danych wejściowych przy logowaniu
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Obsługa endpointu logowania
exports.login = async (req, res) => {
  try {
    // Sprawdzenie poprawności danych wejściowych
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Znalezienie użytkownika w bazie danych
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ message: 'Email or password is wrong' });
    }

    // Porównanie hasła
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email or password is wrong' });
    }

    // Utworzenie tokena
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    user.token = token;
    await user.save();

    // Odpowiedź sukcesu
    res.status(200).json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (err) {
    // Obsługa błędów serwera
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
