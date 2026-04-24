const express = require('express');
const User = require('../models/User');
const Usage = require('../models/Usage');
const apiKeyAuth = require('../middleware/apiKeyAuth');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const availableApis = [
  { id: 'weather', name: 'Weather API', description: 'Fetch weather information using the protected API key endpoint.', price: 1 },
  { id: 'analytics', name: 'Analytics API', description: 'Track usage and get analytics data for your app.', price: 1 },
  { id: 'security', name: 'Security API', description: 'Validate access and monitor protected routes.', price: 1 }
];

router.get('/apis', (req, res) => {
  res.json({ success: true, apis: availableApis });
});

router.get('/profile', authMiddleware, (req, res) => {
  const { firstName, lastName, email, credits, apiKey, role } = req.user;
  res.json({ success: true, profile: { firstName, lastName, email, credits, apiKey, role } });
});

router.get('/protected-data', apiKeyAuth, async (req, res) => {
  try {
    const user = req.user;
    if (user.credits <= 0) {
      return res.status(402).json({ success: false, message: 'Insufficient credits. Please generate a new API key or recharge credits.' });
    }

    user.credits = Math.max(0, user.credits - 1);
    await user.save();

    await Usage.create({ user: user._id, endpoint: '/api/protected-data', creditsUsed: 1 });

    res.json({
      success: true,
      message: 'Protected API returned successfully.',
      data: {
        secret: 'This is your pay-per-api protected data.',
        remainingCredits: user.credits
      }
    });
  } catch (error) {
    console.error('[API] Protected endpoint error:', error);
    res.status(500).json({ success: false, message: 'API request failed.' });
  }
});

router.get('/weather', apiKeyAuth, async (req, res) => {
  try {
    const user = req.user;
    const city = (req.query.city || 'London').trim();
    if (!process.env.OPENWEATHER_API_KEY) {
      return res.status(500).json({ success: false, message: 'OpenWeather API key not configured.' });
    }

    if (user.credits <= 0) {
      return res.status(402).json({ success: false, message: 'Insufficient credits. Please generate a new API key or recharge credits.' });
    }

    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`);
    const weather = await response.json();

    if (!response.ok) {
      return res.status(400).json({ success: false, message: weather.message || 'Weather lookup failed.' });
    }

    user.credits = Math.max(0, user.credits - 1);
    await user.save();
    await Usage.create({ user: user._id, endpoint: '/api/weather', creditsUsed: 1 });

    res.json({ success: true, weather, remainingCredits: user.credits });
  } catch (error) {
    console.error('[API] Weather endpoint error:', error);
    res.status(500).json({ success: false, message: 'Weather API request failed.' });
  }
});

router.get('/usage', authMiddleware, async (req, res) => {
  try {
    const usage = await Usage.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10).lean();
    res.json({ success: true, usage });
  } catch (error) {
    console.error('[API] Usage list error:', error);
    res.status(500).json({ success: false, message: 'Unable to fetch usage.' });
  }
});

module.exports = router;
