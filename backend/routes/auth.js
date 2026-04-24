const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const generateApiKey = require('../utils/generateApiKey');
const { validateRegistration, isValidEmail, isValidPassword } = require('../utils/validators');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const createToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });
};

router.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const validation = validateRegistration({ firstName, lastName, email, password });
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const apiKey = generateApiKey();

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      apiKey,
      credits: 1000
    });

    const token = createToken(user);

    res.json({
      success: true,
      message: 'Signup successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        apiKey: user.apiKey,
        credits: user.credits
      }
    });
  } catch (error) {
    console.error('[Auth] Signup error:', error);
    res.status(500).json({ success: false, message: 'Signup failed.' });
  }
});

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

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        apiKey: user.apiKey,
        credits: user.credits
      }
    });
  } catch (error) {
    console.error('[Auth] Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed.' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  res.json({ success: true, user: req.user });
});

router.post('/regenerate-api-key', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    user.apiKey = generateApiKey();
    await user.save();

    res.json({ success: true, message: 'API key regenerated.', apiKey: user.apiKey });
  } catch (error) {
    console.error('[Auth] Regenerate API key error:', error);
    res.status(500).json({ success: false, message: 'Could not regenerate API key.' });
  }
});

module.exports = router;
