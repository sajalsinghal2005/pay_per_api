const express = require('express');
const router = express.Router();

const aiController = require('../controllers/aiController');
const mapsController = require('../controllers/mapsController');
const emailController = require('../controllers/emailController');

const validateApiKey = require('../middleware/apiKeyAuth');
const rateLimitMiddleware = require('../middleware/rateLimit');
const usageTracking = require('../middleware/usageTracking');

// ============================================
// AI ROUTES
// ============================================

// Generate text with OpenAI
router.post('/ai/generate-text', validateApiKey, rateLimitMiddleware, usageTracking, async (req, res) => {
    await aiController.generateText(req, res);
});

// Generate image with DALL-E
router.post('/ai/generate-image', validateApiKey, rateLimitMiddleware, usageTracking, async (req, res) => {
    await aiController.generateImage(req, res);
});

// ============================================
// MAPS ROUTES
// ============================================

// Geocode address
router.post('/maps/geocode', validateApiKey, rateLimitMiddleware, usageTracking, async (req, res) => {
    await mapsController.geocodeAddress(req, res);
});

// Get directions
router.post('/maps/directions', validateApiKey, rateLimitMiddleware, usageTracking, async (req, res) => {
    await mapsController.getDirections(req, res);
});

// ============================================
// EMAIL ROUTES
// ============================================

// Send single email
router.post('/email/send', validateApiKey, rateLimitMiddleware, usageTracking, async (req, res) => {
    await emailController.sendEmail(req, res);
});

// Send bulk emails
router.post('/email/send-bulk', validateApiKey, rateLimitMiddleware, usageTracking, async (req, res) => {
    await emailController.sendBulkEmails(req, res);
});

module.exports = router;
