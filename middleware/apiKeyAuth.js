const { dbGet } = require('../config/database');

/**
 * Middleware to validate API key
 * Checks if user has valid subscription and active API key
 */
async function validateApiKey(req, res, next) {
    try {
        const apiKey = req.headers['x-api-key'];
        
        if (!apiKey) {
            return res.status(401).json({ 
                success: false, 
                message: 'API key required. Use header: X-API-Key' 
            });
        }

        // Find user with this API key
        const user = await dbGet(
            "SELECT id, email, api_key, subscription_plan, subscription_status FROM users WHERE api_key = ?",
            [apiKey]
        );

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid API key' 
            });
        }

        // Check subscription status
        if (user.subscription_status !== 'active') {
            return res.status(403).json({ 
                success: false, 
                message: 'Subscription inactive. Please upgrade or renew your subscription.' 
            });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (err) {
        console.error('[Auth Middleware Error]:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Authentication error' 
        });
    }
}

module.exports = validateApiKey;
