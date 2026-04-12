require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { db, dbRun, dbGet, dbAll } = require('./config/database');

const app = express();

// ============================================
// MIDDLEWARE SETUP
// ============================================

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ✅ CSP Middleware - Handle Express static CSP conflict
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy',
        "default-src 'self'; " +
        "connect-src 'self' http://localhost:3001 https:; " +
        "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: https:;"
    );
    next();
});

// ============================================
// ROUTES
// ============================================

// Auth Routes
const authRoutes = require('./routes/auth');
app.use('/', authRoutes);

// Payment Routes (Paystack)
const paymentRoute = require('./routes/payment');
app.use('/api', paymentRoute);

// Weather Routes
const weatherRoute = require('./routes/weather');
app.use('/api', weatherRoute);

// Extended APIs (AI, Maps, Email)
const extendedApis = require('./routes/extendedApis');
app.use('/api', extendedApis);

// ============================================
// API MARKETPLACE ROUTES
// ============================================

// Get all active APIs
app.get('/api/apis', async (req, res) => {
    try {
        const apis = await dbAll("SELECT * FROM apis WHERE status='active'");
        res.json(apis);
    } catch (err) {
        console.error('Error fetching APIs:', err);
        res.json([]);
    }
});

// Get all APIs (admin view)
app.get('/api/admin/apis/all', async (req, res) => {
    try {
        const apis = await dbAll("SELECT * FROM apis");
        res.json(apis);
    } catch (err) {
        res.json([]);
    }
});

// Get user API usage stats
app.get('/api/user/:userId/usage', async (req, res) => {
    try {
        const usage = await dbGet(
            `SELECT * FROM api_usage WHERE user_id = ? ORDER BY date DESC LIMIT 7`,
            [req.params.userId]
        );
        res.json({
            success: true,
            data: usage || []
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ============================================
// STATIC FILES
// ============================================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((err, req, res, next) => {
    console.error('[Error]:', err);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[Error] Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('[Error] Uncaught Exception:', err);
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`✅ API Hub running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 Endpoints: /api/weather, /api/payment, /api/ai, /api/maps, /api/email`);
});

module.exports = app;

