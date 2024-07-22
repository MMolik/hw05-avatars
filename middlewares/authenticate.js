const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticate = async (req, res, next) => {
  const { authorization = '' } = req.headers;
  const [bearer, token] = authorization.split(' ');

  console.log('Authorization header:', authorization);
  console.log('Bearer:', bearer);
  console.log('Token:', token);

  if (bearer !== 'Bearer' || !token) {
    console.log('No Bearer token provided or token is missing');
    return res.status(401).json({
      status: 'error',
      code: 401,
      message: 'Not authorized',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    const user = await User.findById(decoded.id);
    console.log('User found by ID:', user);

    if (!user) {
      console.log('User not found');
      return res.status(401).json({
        status: 'error',
        code: 401,
        message: 'Not authorized',
      });
    }

    req.user = user;
    console.log('User assigned to req.user:', req.user); // Loguj zawartość req.user
    next();
  } catch (error) {
    console.log('Error during token verification:', error);
    return res.status(401).json({
      status: 'error',
      code: 401,
      message: 'Not authorized',
    });
  }
};

module.exports = authenticate;
