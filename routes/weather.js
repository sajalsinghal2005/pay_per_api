const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/weather", async (req, res) => {
  try {
    const city = req.query.city || "Jaipur";
    const apiKey = process.env.WEATHER_API_KEY;

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );

    res.json({
      city: response.data.name,
      temperature: response.data.main.temp,
      weather: response.data.weather[0].description
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching real weather data"
    });
  }
});

module.exports = router;