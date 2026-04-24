const express = require('express');
const axios = require('axios');
const authMiddleware = require('../middleware/auth');
const Usage = require('../models/Usage');

const router = express.Router();

router.get('/weather', authMiddleware, async (req, res) => {
  try {
    const city = req.query.city || 'Jaipur';
    const weatherApiKey = process.env.WEATHER_API_KEY;

    if (!weatherApiKey) {
      return res.status(500).json({ success: false, message: 'Weather API key is not configured.' });
    }

    const user = req.user;
    if (user.credits <= 0) {
      return res.status(402).json({ success: false, message: 'No credits remaining. Please top up your account.' });
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${weatherApiKey}&units=metric`
    );

    user.credits = Math.max(0, user.credits - 1);
    await user.save();

    await Usage.create({ user: user._id, endpoint: '/api/weather', creditsUsed: 1 });

    res.json({
      success: true,
      city: response.data.name,
      temperature: response.data.main.temp,
      weather: response.data.weather[0].description,
      remainingCredits: user.credits
    });
  } catch (error) {
    console.error('[Weather] Error fetching weather:', error?.response?.data || error.message || error);

    if (error.response && error.response.data && error.response.data.message) {
      return res.status(400).json({ success: false, message: error.response.data.message });
    }

    res.status(500).json({ success: false, message: 'Error fetching real weather data.' });
  }
});

module.exports = router;
