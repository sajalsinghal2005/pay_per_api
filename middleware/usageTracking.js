const { dbGet, dbRun } = require('../config/database');

/**
 * Usage tracking middleware
 * Logs API requests and updates usage stats in database
 */
async function usageTrackingMiddleware(req, res, next) {
    // Capture original json method
    const originalJson = res.json;

    res.json = function(data) {
        // After response, log usage
        trackUsage(req, res, data).catch(err => 
            console.error('[Usage Tracking Error]:', err)
        );
        
        return originalJson.call(this, data);
    };

    next();
}

async function trackUsage(req, res, responseData) {
    try {
        if (!req.user) return;

        const userId = req.user.id;
        const endpoint = req.path;
        const method = req.method;
        const status = res.statusCode;
        const today = new Date().toISOString().split('T')[0];

        // Check if record exists for today
        const existing = await dbGet(
            `SELECT id, total_requests FROM api_usage 
             WHERE user_id = ? AND DATE(date) = ?`,
            [userId, today]
        );

        if (existing) {
            // Update existing
            await dbRun(
                `UPDATE api_usage 
                 SET total_requests = total_requests + 1,
                     last_request_at = CURRENT_TIMESTAMP
                 WHERE id = ?`,
                [existing.id]
            );
        } else {
            // Create new
            await dbRun(
                `INSERT INTO api_usage (user_id, date, total_requests, last_request_at)
                 VALUES (?, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP)`,
                [userId]
            );
        }

        // Log request details
        console.log(`[Usage] User ${userId} - ${method} ${endpoint} - ${status}`);
    } catch (err) {
        console.error('[Usage Tracking Error]:', err);
    }
}

module.exports = usageTrackingMiddleware;
