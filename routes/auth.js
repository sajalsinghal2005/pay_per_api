const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const generateApiKey = () => {
  return 'api_' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
};

const createToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });
};

const createUserResponse = (user) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  apiKey: user.apiKey,
  credits: user.credits
});

const handleRegister = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Please provide first name, last name, valid email, and a password with at least 6 characters.'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      apiKey: generateApiKey(),
      credits: 1000
    });

    const token = createToken(user);
    res.json({ success: true, message: 'Signup successful.', token, user: createUserResponse(user) });
  } catch (error) {
    console.error('[Auth] Signup error:', error);
    res.status(500).json({ success: false, message: 'Signup failed.' });
  }
};

router.post('/register', handleRegister);
router.post('/signup', handleRegister);

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = createToken(user);
    res.json({ success: true, message: 'Login successful.', token, user: createUserResponse(user) });
  } catch (error) {
    console.error('[Auth] Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed.' });
  }
});

router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authorization token missing.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, user: createUserResponse(user) });
  } catch (error) {
    console.error('[Auth] Me error:', error);
    res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
});

router.post('/regenerate-api-key', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authorization token missing.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    user.apiKey = generateApiKey();
    await user.save();

    res.json({ success: true, message: 'API key regenerated.', apiKey: user.apiKey });
  } catch (error) {
    console.error('[Auth] Regenerate API key error:', error);
    res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
});

module.exports = router;
