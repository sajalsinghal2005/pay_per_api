const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Determine database path
const dbPath = path.resolve(__dirname, '../app.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Database connection error:", err);
    } else {
        console.log("Connected to SQLite database at " + dbPath);
    }
});

// Enable Foreign Keys
db.run("PRAGMA foreign_keys = ON");

// Initialize Schema & Seed Data
db.serialize(() => {
    /* =========================
       USERS TABLE
    ========================= */
    db.run(`
        CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            firstName TEXT NOT NULL,
            lastName TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            contact TEXT,
            role TEXT DEFAULT 'user',
            credits INTEGER DEFAULT 500,
            apiKey TEXT,
            subscription_tier TEXT DEFAULT 'Free',
            status TEXT DEFAULT 'active',
            organization TEXT,
            autoRecharge BOOLEAN DEFAULT FALSE,
            lowCreditNotifications BOOLEAN DEFAULT TRUE,
            sessionTimeout INTEGER DEFAULT 30,
            twoFactorAuth BOOLEAN DEFAULT FALSE
        )
    `);

    /* =========================
       APIS TABLE
    ========================= */
    db.run(`
        CREATE TABLE IF NOT EXISTS apis(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            provider TEXT,
            description TEXT,
            category TEXT,
            price INTEGER DEFAULT 0,
            image TEXT,
            badge TEXT,
            status TEXT DEFAULT 'active'
        )
    `);

    /* =========================
       USER APIS TABLE
    ========================= */
    db.run(`
        CREATE TABLE IF NOT EXISTS user_apis(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            api_id INTEGER,
            api_key TEXT,
            status TEXT DEFAULT 'active',
            purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, api_id),
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY(api_id) REFERENCES apis(id) ON DELETE CASCADE
        )
    `);

    /* =========================
       TRANSACTIONS TABLE
    ========================= */
    db.run(`
        CREATE TABLE IF NOT EXISTS transactions(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            type TEXT,
            amount INTEGER,
            description TEXT,
            tx_hash TEXT,
            date DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    /* =========================
       SETTINGS TABLE
    ========================= */
    db.run(`
        CREATE TABLE IF NOT EXISTS settings(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userRateLimit INTEGER DEFAULT 100,
            globalTrafficCap INTEGER DEFAULT 1000000,
            maintenanceMode BOOLEAN DEFAULT FALSE
        )
    `);

    /* =========================
       SEED ADMIN
    ========================= */
    db.get("SELECT * FROM users WHERE email=?", ['admin@admin.com'], (err, row) => {
        if (!row) {
            db.run(`
                INSERT INTO users (firstName, lastName, email, password, role, credits, apiKey, status)
                VALUES (?,?,?,?,?,?,?,?)
            `, ['Admin', 'User', 'admin@admin.com', 'admin', 'admin', 5000, 'ak_live_admin_master_key', 'active']);
            console.log("Admin user seeded");
        }
    });

    /* =========================
       SEED APIs
    ========================= */
    db.get("SELECT COUNT(*) as count FROM apis", (err, row) => {
        if (row && row.count === 0) {
            const stmt = db.prepare(`
                INSERT INTO apis (name, provider, description, category, price, image, badge, status)
                VALUES (?,?,?,?,?,?,?,?)
            `);

            const sampleApis = [
                ['MapBox API', 'MapBox', 'High-performance vector maps and geocoding', 'Maps', 100, 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=600', 'Popular', 'active'],
                ['WeatherCast API', 'AtmoSphere', 'Real-time Weather Data', 'Weather', 50, 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?q=80&w=600', 'Trending', 'active'],
                ['PayStack API', 'FinSecure', 'Secure Payment Gateway', 'Payments', 200, 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=600', null, 'active'],
                ['CloudStore API', 'InfraCloud', 'Object storage and file management', 'Storage', 150, 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600', 'New', 'active'],
                ['InsightLytics API', 'DataDriven Co.', 'Advanced analytics and tracking', 'Analytics', 250, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600', 'Trending', 'active'],
                ['AuthShield API', 'SecureLayer', 'Authentication & Identity', 'Security', 150, 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=600', null, 'active'],
                ['VisionAI API', 'DeepSight', 'Computer vision and image recognition', 'AI', 300, 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?q=80&w=600', null, 'active'],
                ['BlockChain Core', 'CryptoTech', 'Decentralized ledger API for web3', 'Blockchain', 450, 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=600', null, 'active'],
                ['ShipTrack API', 'LogiFlow', 'Global shipping and parcel tracking', 'E-commerce', 120, 'https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=600', null, 'active'],
                ['CodeLint Pro', 'DevArmor', 'Automated code review and security linting', 'DevTools', 140, 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=600', null, 'active'],
                ['FinanceFlow API', 'BankWise', 'Real-time stock and crypto market data', 'Finance', 350, 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600', null, 'active']
            ];

            sampleApis.forEach(api => stmt.run(...api));
            stmt.finalize();
            console.log("APIs seeded");
        }
    });

    /* =========================
       SEED SETTINGS
    ========================= */
    db.get("SELECT COUNT(*) as count FROM settings", (err, row) => {
        if (row && row.count === 0) {
            db.run("INSERT INTO settings (userRateLimit, globalTrafficCap, maintenanceMode) VALUES (100, 1000000, FALSE)");
            console.log("Global Settings seeded");
        }
    });
});

/**
 * Database Query Helpers - Promise-based wrappers
 */
const dbRun = (sql, params = []) =>
    new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });

const dbGet = (sql, params = []) =>
    new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });

const dbAll = (sql, params = []) =>
    new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
        });
    });

module.exports = {
    db,
    dbRun,
    dbGet,
    dbAll
};
