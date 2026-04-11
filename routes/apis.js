/**
 * API Marketplace Routes
 * GET /api/apis - List all available APIs
 * POST /api/apis/purchase - Purchase API with credits
 * POST /api/apis/purchase-crypto - Purchase API with crypto
 */

const express = require('express');
const router = express.Router();
const { dbGet, dbRun, dbAll } = require('../config/database');
const { verifyBlockchainTransaction } = require('../config/blockchain');

/**
 * GET /api/apis
 * List all active APIs with pricing and details
 */
router.get('/api/apis', async (req, res) => {
    try {
        const apis = await dbAll("SELECT * FROM apis WHERE status='active'");
        res.json(apis || []);
    } catch (error) {
        console.error('[API] Get APIs error:', error.message);
        res.status(500).json({ success: false, apis: [] });
    }
});

/**
 * GET /api/admin/apis/all
 * Admin endpoint: List all APIs (including inactive)
 */
router.get('/api/admin/apis/all', async (req, res) => {
    try {
        const apis = await dbAll("SELECT * FROM apis");
        res.json(apis || []);
    } catch (error) {
        console.error('[API] Get all APIs error:', error.message);
        res.status(500).json({ success: false, apis: [] });
    }
});

/**
 * POST /api/apis/purchase
 * Purchase API with credits from user account
 */
router.post('/api/apis/purchase', async (req, res) => {
    try {
        const { userId, apiId } = req.body;

        if (!userId || !apiId) {
            return res.status(400).json({ 
                success: false, 
                message: 'userId and apiId are required' 
            });
        }

        // Get API details
        const api = await dbGet(
            "SELECT * FROM apis WHERE id=? AND status='active'",
            [apiId]
        );

        if (!api) {
            return res.status(404).json({ 
                success: false, 
                message: 'API not found or unavailable' 
            });
        }

        // Get user details
        const user = await dbGet("SELECT * FROM users WHERE id=?", [userId]);

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        if (user.status === 'suspended') {
            return res.status(403).json({ 
                success: false, 
                message: 'Account suspended. Contact support.' 
            });
        }

        // Check if already purchased
        const existing = await dbGet(
            "SELECT id FROM user_apis WHERE user_id=? AND api_id=?",
            [userId, apiId]
        );

        if (existing) {
            return res.status(409).json({ 
                success: false, 
                message: 'This API is already in your collection' 
            });
        }

        // Check credits
        if (user.credits < api.price) {
            return res.status(402).json({ 
                success: false, 
                message: `Insufficient credits. Need ${api.price}, have ${user.credits}` 
            });
        }

        // Generate unique API key
        const uniqueApiKey = 'ak_svc_' + Math.random().toString(36).substring(2);

        // Insert user_api mapping
        await dbRun(
            "INSERT INTO user_apis(user_id, api_id, api_key) VALUES(?, ?, ?)",
            [userId, apiId, uniqueApiKey]
        );

        // Deduct credits
        await dbRun(
            "UPDATE users SET credits=credits-? WHERE id=?",
            [api.price, userId]
        );

        // Log transaction
        await dbRun(
            "INSERT INTO transactions(user_id, type, amount, description) VALUES(?, ?, ?, ?)",
            [userId, 'purchase', api.price, `Purchased ${api.name}`]
        );

        console.log(`[API] ✓ Purchase: User ${userId} bought ${api.name}`);

        res.json({ 
            success: true, 
            message: 'API purchased successfully',
            api_key: uniqueApiKey,
            creditsRemaining: user.credits - api.price
        });

    } catch (error) {
        console.error('[API] Purchase error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Purchase failed. Please try again.' 
        });
    }
});

/**
 * POST /api/apis/purchase-crypto
 * Purchase API with cryptocurrency (blockchain verification)
 */
router.post('/api/apis/purchase-crypto', async (req, res) => {
    try {
        const { userId, apiId, txHash } = req.body;

        if (!userId || !apiId || !txHash) {
            return res.status(400).json({ 
                success: false, 
                message: 'userId, apiId, and txHash are required' 
            });
        }

        // Get API details
        const api = await dbGet(
            "SELECT * FROM apis WHERE id=? AND status='active'",
            [apiId]
        );

        if (!api) {
            return res.status(404).json({ 
                success: false, 
                message: 'API not found or unavailable' 
            });
        }

        // Get user details
        const user = await dbGet("SELECT * FROM users WHERE id=?", [userId]);

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Check for duplicate transaction
        const existingTx = await dbGet(
            "SELECT id FROM transactions WHERE tx_hash=?",
            [txHash]
        );

        if (existingTx) {
            return res.status(409).json({ 
                success: false, 
                message: 'This transaction has already been processed' 
            });
        }

        // Verify blockchain transaction
        const verification = await verifyBlockchainTransaction(txHash);

        if (!verification.success) {
            return res.status(400).json({ 
                success: false, 
                message: verification.message 
            });
        }

        // Apply crypto discount (20% off)
        const discountedPrice = Math.floor(api.price * 0.8);

        // Check if already purchased
        const existing = await dbGet(
            "SELECT id FROM user_apis WHERE user_id=? AND api_id=?",
            [userId, apiId]
        );

        if (existing) {
            return res.status(409).json({ 
                success: false, 
                message: 'This API is already in your collection' 
            });
        }

        // Generate unique API key
        const uniqueApiKey = 'ak_svc_' + Math.random().toString(36).substring(2);

        // Insert user_api mapping
        await dbRun(
            "INSERT INTO user_apis(user_id, api_id, api_key) VALUES(?, ?, ?)",
            [userId, apiId, uniqueApiKey]
        );

        // Log transaction with blockchain verification
        await dbRun(
            "INSERT INTO transactions(user_id, type, amount, description, tx_hash, status) VALUES(?, ?, ?, ?, ?, ?)",
            [userId, 'purchase', discountedPrice, `${api.name} - Crypto Purchase (20% discount)`, txHash, 'confirmed']
        );

        console.log(`[API] ✓ Crypto Purchase: User ${userId} bought ${api.name} (tx: ${txHash.substring(0, 10)}...)`);

        res.json({ 
            success: true, 
            message: 'API purchased via cryptocurrency!',
            api_key: uniqueApiKey,
            discount: '20%',
            amountPaid: discountedPrice,
            totalValue: api.price
        });

    } catch (error) {
        console.error('[API] Crypto purchase error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Purchase failed. Please try again.' 
        });
    }
});

module.exports = router;
