const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+@.+\..+/, 'Please enter a valid email address'], // Walidacja formatu e-mail
  },
  password: {
    type: String,
    required: true,
  },
  avatarURL: {
    type: String,
  },
});

// Hashowanie hasła przed zapisaniem użytkownika
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Tylko jeśli hasło zostało zmienione
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Metoda do porównywania hasła
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Error comparing passwords');
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User;
