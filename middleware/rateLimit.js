const { dbGet, dbRun } = require('../config/database');

/**
 * Rate limiting middleware
 * Checks usage against subscription plan limits
 */
async function rateLimitMiddleware(req, res, next) {
    try {
        if (!req.user) {
            return next(); // Skip if not authenticated
        }

        const userId = req.user.id;
        const userPlan = req.user.subscription_plan || 'free';

        // Define rate limits per plan (requests per day)
        const planLimits = {
            'free': 100,
            'basic': 1000,
            'pro': 10000,
            'enterprise': 100000
        };

        const dailyLimit = planLimits[userPlan] || 100;

        // Get today's usage
        const today = new Date().toISOString().split('T')[0];
        const usage = await dbGet(
            `SELECT total_requests FROM api_usage 
             WHERE user_id = ? AND DATE(date) = ?`,
            [userId, today]
        );

        const currentUsage = usage?.total_requests || 0;

        // Check if limit exceeded
        if (currentUsage >= dailyLimit) {
            return res.status(429).json({
                success: false,
                message: `Rate limit exceeded. Daily limit: ${dailyLimit}. Reset tomorrow.`,
                current: currentUsage,
                limit: dailyLimit
            });
        }

        // Store limit info for logging
        req.rateLimit = {
            limit: dailyLimit,
            current: currentUsage,
            remaining: dailyLimit - currentUsage
        };

        next();
    } catch (err) {
        console.error('[Rate Limit Middleware Error]:', err);
        next(); // Allow request even if rate limit check fails
    }
}

module.exports = rateLimitMiddleware;
