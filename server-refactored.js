/**
 * API Hub - Main Server Entry Point
 * Modular Express.js application with MongoDB-like SQLite backend
 * 
 * Structure:
 * - config/ - Configuration files (email, blockchain, database)
 * - routes/ - Route handlers (auth, apis, user, admin)
 * - controllers/ - Business logic
 * - middleware/ - Custom middleware
 * - utils/ - Utility functions
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

// ==========================================
// ENVIRONMENT & CONFIG
// ==========================================
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ==========================================
// INITIALIZE EXPRESS
// ==========================================
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ==========================================
// LOGGER MIDDLEWARE
// ==========================================
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ==========================================
// ROUTES
// ==========================================

// Static home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Import route modules
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/apis');

// Register routes
app.use(authRoutes);  // /send-otp, /verify-otp, /register, /login, etc.
app.use(apiRoutes);   // /api/apis, /api/apis/purchase, etc.

// ==========================================
// HEALTH CHECK ENDPOINT
// ==========================================
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        environment: NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// ==========================================
// ERROR HANDLERS
// ==========================================

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Endpoint ${req.method} ${req.path} not found`
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('[Error]', err.message);
    res.status(err.status || 500).json({
        success: false,
        message: NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message
    });
});

// ==========================================
// UNHANDLED PROMISE REJECTION
// ==========================================
process.on('unhandledRejection', (reason, promise) => {
    console.error('[Unhandled Rejection]', reason);
});

process.on('uncaughtException', (err) => {
    console.error('[Uncaught Exception]', err.message);
    process.exit(1);
});

// ==========================================
// START SERVER
// ==========================================
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║        🚀 API HUB SERVER RUNNING        ║
╠════════════════════════════════════════╣
║  Environment: ${NODE_ENV.padEnd(28)} ║
║  Port: ${PORT.toString().padEnd(33)} ║
║  URL: http://localhost:${PORT.toString().padEnd(24)} ║
╚════════════════════════════════════════╝
    `);
});

module.exports = app;
