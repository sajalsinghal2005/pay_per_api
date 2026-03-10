const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('app.db', (err) => {
    if (err) {
        console.error("Database connection error:", err);
    } else {
        console.log("Connected to SQLite database");
    }
});

// Enable Foreign Keys
db.run("PRAGMA foreign_keys = ON");

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

    // Add missing columns if user table already existed
    const userColumns = ['organization TEXT', 'autoRecharge BOOLEAN DEFAULT FALSE', 'lowCreditNotifications BOOLEAN DEFAULT TRUE', 'sessionTimeout INTEGER DEFAULT 30', 'twoFactorAuth BOOLEAN DEFAULT FALSE'];
    userColumns.forEach(col => {
        db.run(`ALTER TABLE users ADD COLUMN ${col}`, () => { });
    });

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
            date DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    /* =========================
       SETTINGS TABLE (Global Config)
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
    db.get(
        "SELECT * FROM users WHERE email=?",
        ['admin@admin.com'],
        (err, row) => {
            if (!row) {
                db.run(`
                    INSERT INTO users
                    (firstName,lastName,email,password,role,credits,apiKey,status)
                    VALUES(?,?,?,?,?,?,?,?)
                `, [
                    'Admin',
                    'User',
                    'admin@admin.com',
                    'admin',
                    'admin',
                    1000000,
                    'ak_live_admin_master_key',
                    'active'
                ]);

                console.log("Admin user seeded");
            }
        }
    );

    /* =========================
       SEED APIs
    ========================= */
    db.get("SELECT COUNT(*) as count FROM apis", (err, row) => {
        if (row.count === 0) {

            const stmt = db.prepare(`
                INSERT INTO apis
                (name,provider,description,category,price,image,badge,status)
                VALUES(?,?,?,?,?,?,?,?)
            `);

            stmt.run(
                'MapBox API',
                'MapBox',
                'High-performance vector maps and geocoding',
                'Maps',
                100,
                'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=600',
                'Popular',
                'active'
            );

            stmt.run(
                'WeatherCast API',
                'AtmoSphere',
                'Real-time Weather Data',
                'Weather',
                50,
                'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?q=80&w=600',
                'Trending',
                'active'
            );

            stmt.run(
                'PayStack API',
                'FinSecure',
                'Secure Payment Gateway',
                'Payments',
                200,
                'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=600',
                null,
                'active'
            );

            stmt.run(
                'CloudStore API',
                'InfraCloud',
                'Object storage and file management',
                'Storage',
                150,
                'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600',
                'New',
                'active'
            );

            stmt.run(
                'InsightLytics API',
                'DataDriven Co.',
                'Advanced analytics and tracking',
                'Analytics',
                250,
                'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600',
                'Trending',
                'active'
            );

            stmt.run(
                'AuthShield API',
                'SecureLayer',
                'Authentication & Identity',
                'Security',
                150,
                'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=600',
                'active'
            );

            // --- ALL NEW APIs ---
            stmt.run(
                'VisionAI API',
                'DeepSight',
                'Computer vision and image recognition',
                'AI',
                300,
                'https://images.unsplash.com/photo-1507146426996-ef05306b995a?q=80&w=600',
                'active'
            );

            stmt.run(
                'BlockChain Core',
                'CryptoTech',
                'Decentralized ledger API for web3',
                'Blockchain',
                450,
                'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=600',
                'active'
            );

            stmt.run(
                'ShipTrack API',
                'LogiFlow',
                'Global shipping and parcel tracking',
                'E-commerce',
                120,
                'https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=600',
                'active'
            );

            stmt.run(
                'GameStat Pro',
                'PlayMetrics',
                'Real-time gaming stats and leaderboards',
                'Gaming',
                80,
                'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600',
                'active'
            );

            stmt.run(
                'HealthSync API',
                'MediLink',
                'Patient data and vitals synchronization',
                'Health',
                500,
                'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=600',
                'active'
            );

            stmt.run(
                'IoT Connect',
                'SmartNodes',
                'Manage and monitor IoT device networks',
                'IoT',
                180,
                'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600',
                'active'
            );

            stmt.run(
                'SocialGraph API',
                'ConnectHub',
                'Social media graph and influencer data',
                'Social',
                220,
                'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600',
                'active'
            );

            stmt.run(
                'TranslateNow',
                'LinguaSoft',
                'Global translation and localization',
                'Utility',
                100,
                'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=600',
                'active'
            );

            stmt.run(
                'EcoMetric API',
                'GreenWatch',
                'Track carbon footprint and sustainability',
                'Environment',
                60,
                'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=600',
                'active'
            );

            stmt.run(
                'CodeLint Pro',
                'DevArmor',
                'Automated code review and security linting',
                'DevTools',
                140,
                'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=600',
                'active'
            );

            stmt.run(
                'FinanceFlow API',
                'BankWise',
                'Real-time stock and crypto market data',
                'Finance',
                350,
                'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600',
                'active'
            );

            stmt.finalize();

            console.log("APIs seeded");
        }
    });

    /* =========================
       SEED SETTINGS
    ========================= */
    db.get("SELECT COUNT(*) as count FROM settings", (err, row) => {
        if (row.count === 0) {
            db.run("INSERT INTO settings (userRateLimit, globalTrafficCap, maintenanceMode) VALUES (100, 1000000, FALSE)");
            console.log("Global Settings seeded");
        }
    });

});

module.exports = db;