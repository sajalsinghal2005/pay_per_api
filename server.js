require('dotenv').config(); // Load environment variables FIRST
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
const { db, dbRun, dbGet, dbAll } = require('./config/database');
const connectMongo = require('./config/mongo');
const authRoutes = require('./routes/auth');
const weatherRoute = require('./routes/weather');
const paymentRoute = require('./routes/payment');
const authMiddleware = require('./middleware/auth');
const Usage = require('./models/Usage');


const app = express();

app.use(cors());
app.use(express.json());

// Override CSP for all responses - MUST come before express.static
app.use((req, res, next) => {
    // Remove any existing CSP headers
    res.removeHeader('Content-Security-Policy');
    res.removeHeader('X-Content-Security-Policy');
    
    // Set permissive CSP
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

app.use(express.static(__dirname));

// Override CSP again for static files (second pass)
app.use((req, res, next) => {
    res.removeHeader('Content-Security-Policy');
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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Global Error Handlers to prevent crash
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception thrown:', err);
});

// --- Nodemailer & OTP Configuration ---
// ✅ Use environment variables so credentials can be changed without editing code.
const EMAIL_USER = process.env.EMAIL_USER || 'sajalsinghal62650@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'mbexkymmjmukocsz';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,   // 10 seconds
    socketTimeout: 15000      // 15 seconds
});

// Verify SMTP configuration at startup for easier debugging.
transporter.verify((err, success) => {
    if (err) {
        console.error('[Email] SMTP verification failed:', err.message);
    } else {
        console.log('[Email] SMTP connection verified');
    }
});

/* =========================
   DB HELPERS
========================= */
// Redundant wrappers removed, using those from config/database.js

// Blockchain Verification Helper (Monad Testnet)
const RPC_URL = 'https://testnet-rpc.monad.xyz/';
const MY_WALLET_ADDRESS = "0x7894561230987456123098745612309874561230".toLowerCase();

async function verifyBlockchainTransaction(txHash) {
    try {
        const response = await fetch(RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "eth_getTransactionByHash",
                params: [txHash],
                id: 1
            })
        });
        const data = await response.json();
        const tx = data.result;

        if (!tx) return { success: false, message: "Transaction not found" };

        // Verify recipient
        if (tx.to && tx.to.toLowerCase() !== MY_WALLET_ADDRESS) {
            return { success: false, message: "Invalid recipient" };
        }

        // Verify amount (0.001 ETH = 1e15 wei)
        const valueWei = BigInt(tx.value);
        const minWei = BigInt("1000000000000000"); // 0.001 ETH
        if (valueWei < minWei) {
            return { success: false, message: "Insufficient amount" };
        }

        // Check transaction receipt for status
        const receiptResponse = await fetch(RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "eth_getTransactionReceipt",
                params: [txHash],
                id: 2
            })
        });
        const receiptData = await receiptResponse.json();
        const receipt = receiptData.result;

        if (!receipt) return { success: false, message: "Transaction pending or not found" };
        if (receipt.status !== "0x1") return { success: false, message: "Transaction failed" };

        return { success: true };
    } catch (err) {
        console.error("Blockchain verification error:", err);
        return { success: false, message: "Verification service error" };
    }
}

/* =========================
   AUTH
========================= */

/* =========================
   AUTH SYSTEM (SIMPLIFIED - NO OTP)
========================= */

// Use the modular auth routes from routes/auth.js
app.use('/api/auth', authRoutes);
app.use('/api', weatherRoute);
app.use('/api', paymentRoute);

app.get('/api/dashboard/usage', authMiddleware, async (req, res) => {
  try {
    const history = await Usage.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json({ success: true, history });
  } catch (error) {
    console.error('[Dashboard] Usage error:', error);
    res.status(500).json({ success: false, message: 'Unable to load usage history.' });
  }
});

/* =========================

/* =========================
   MARKETPLACE
========================= */

app.get('/api/apis', async (req, res) => {
    try {
        const apis = await dbAll("SELECT * FROM apis WHERE status='active'");
        res.json(apis);
    } catch (err) {
        res.json([]);
    }
});

app.get('/api/admin/apis/all', async (req, res) => {
    try {
        const apis = await dbAll("SELECT * FROM apis");
        res.json(apis);
    } catch (err) {
        res.json([]);
    }
});

app.post('/api/apis/purchase', async (req, res) => {
    const { userId, apiId } = req.body;

    try {
        const api = await dbGet(
            "SELECT * FROM apis WHERE id=? AND status='active'",
            [apiId]
        );

        if (!api)
            return res.json({ success: false, message: 'API unavailable' });

        const user = await dbGet("SELECT * FROM users WHERE id=?", [userId]);

        if (!user)
            return res.json({ success: false, message: 'User not found' });

        if (user.status === 'suspended')
            return res.json({ success: false, message: 'User Suspended' });

        // Duplicate purchase check
        const existing = await dbGet(
            "SELECT * FROM user_apis WHERE user_id=? AND api_id=?",
            [userId, apiId]
        );

        if (existing)
            return res.json({ success: false, message: 'Already purchased' });

        if (user.credits < api.price)
            return res.json({ success: false, message: 'Insufficient credits' });

        const uniqueSvcKey = 'ak_svc_' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);

        await dbRun(
            "INSERT INTO user_apis(user_id,api_id,api_key) VALUES(?,?,?)",
            [userId, apiId, uniqueSvcKey]
        );

        await dbRun(
            "UPDATE users SET credits=credits-? WHERE id=?",
            [api.price, userId]
        );

        await dbRun(
            "INSERT INTO transactions(user_id,type,amount,description) VALUES(?,?,?,?)",
            [userId, 'purchase', api.price, `Purchased ${api.name}`]
        );

        res.json({ success: true, message: 'API Purchased Successfully', api_key: uniqueSvcKey });

    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

app.post('/api/apis/purchase-crypto', async (req, res) => {
    const { userId, apiId, txHash, walletAddress } = req.body;

    try {
        const api = await dbGet("SELECT * FROM apis WHERE id=? AND status='active'", [apiId]);
        if (!api) return res.json({ success: false, message: 'API unavailable' });

        const user = await dbGet("SELECT * FROM users WHERE id=?", [userId]);
        if (!user) return res.json({ success: false, message: 'User not found' });

        // Check for duplicate transaction hash
        if (txHash) {
            const duplicateTx = await dbGet("SELECT id FROM transactions WHERE tx_hash=?", [txHash]);
            if (duplicateTx) return res.json({ success: false, message: 'Transaction already processed' });
        }

        const verification = await verifyBlockchainTransaction(txHash);
        if (!verification.success) {
            return res.json({ success: false, message: verification.message });
        }
        if (!verification.success) {
            return res.json({ success: false, message: verification.message });
        }

        const discountedPrice = Math.floor(api.price * 0.8);

        const existing = await dbGet(
            "SELECT * FROM user_apis WHERE user_id=? AND api_id=?",
            [userId, apiId]
        );
        if (existing) return res.json({ success: false, message: 'Already purchased' });

        const uniqueSvcKey = 'ak_svc_' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);

        await dbRun(
            "INSERT INTO user_apis(user_id,api_id,api_key) VALUES(?,?,?)",
            [userId, apiId, uniqueSvcKey]
        );

        await dbRun(
            "INSERT INTO transactions(user_id,type,amount,description,tx_hash) VALUES(?,?,?,?,?)",
            [userId, 'purchase', discountedPrice, `Purchased ${api.name} via MetaMask`, txHash]
        );

        res.json({ success: true, message: 'API Purchased via Blockchain!', api_key: uniqueSvcKey });

    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});


/* =========================
   USER DASHBOARD
========================= */

app.get('/api/user/:id/dashboard', async (req, res) => {
    try {
        const user = await dbGet(
            "SELECT credits,apiKey FROM users WHERE id=?",
            [req.params.id]
        );

        const apis = await dbAll(`
            SELECT a.id as apiId, a.name, a.category, a.badge, ua.id as userApiId, ua.api_key
            FROM user_apis ua
            JOIN apis a ON ua.api_id=a.id
            WHERE ua.user_id=?`,
            [req.params.id]
        );

        res.json({
            credits: user?.credits || 0,
            apiKey: user?.apiKey || '',
            activeApis: apis
        });

    } catch (err) {
        res.json({ credits: 0, apiKey: '', activeApis: [] });
    }
});

app.get('/api/user/:id/billing', async (req, res) => {
    try {
        const rows = await dbAll(
            "SELECT * FROM transactions WHERE user_id=? ORDER BY date DESC",
            [req.params.id]
        );
        res.json(rows);
    } catch {
        res.json([]);
    }
});

app.get('/api/user/:id/usage', async (req, res) => {
    try {
        // Fetch APIs this user has purchased
        const apis = await dbAll(`
            SELECT a.id, a.name 
            FROM user_apis ua
            JOIN apis a ON ua.api_id = a.id
            WHERE ua.user_id = ?`,
            [req.params.id]
        );

        if (apis.length === 0) {
            return res.json({ success: true, datasets: [] });
        }

        const colors = ['#1f4ed8', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

        // Build datasets array for Chart.js
        let grandTotalRequests = 0;
        const datasets = apis.map((api, index) => {
            // Generate some realistic dummy data for 7 days based on the API ID
            const baseTraffic = (api.id * 1200) + 500;
            const data = Array.from({ length: 7 }, () => {
                const daily = Math.floor(baseTraffic + (Math.random() * 2000));
                grandTotalRequests += daily;
                return daily;
            });

            return {
                label: api.name,
                data: data,
                backgroundColor: colors[index % colors.length],
                borderRadius: 4,
            };
        });

        // Generate dynamic summary metrics
        const avgLatency = Math.floor(120 + (Math.random() * 100)); // 120-220ms
        const errorRate = (0.2 + (Math.random() * 1.5)).toFixed(1); // 0.2% - 1.7%

        res.json({
            success: true,
            datasets,
            totalRequests: grandTotalRequests.toLocaleString(),
            avgLatency: `${avgLatency} ms`,
            errorRate: `${errorRate}%`
        });

    } catch (err) {
        res.json({ success: false, datasets: [] });
    }
});

app.post('/api/user/:userId/apis/:apiId/remove', async (req, res) => {
    try {
        // We delete by api_id and user_id to ensure they only remove their own API
        await dbRun(
            "DELETE FROM user_apis WHERE user_id=? AND api_id=?",
            [req.params.userId, req.params.apiId]
        );
        res.json({ success: true, message: 'API removed successfully' });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

app.get('/api/user/:id/subscription', async (req, res) => {
    try {
        const user = await dbGet("SELECT subscription_tier FROM users WHERE id=?", [req.params.id]);
        res.json({
            success: true,
            subscription_tier: user?.subscription_tier || 'Free',
            paymentMethod: 'Visa ending in 4242' // Mocked Stripe token output
        });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

app.get('/api/user/:id/settings', async (req, res) => {
    try {
        const user = await dbGet(`
            SELECT firstName, lastName, email, organization, apiKey, 
            autoRecharge, lowCreditNotifications, sessionTimeout, twoFactorAuth 
            FROM users WHERE id=?`,
            [req.params.id]
        );
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, settings: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/user/:id/settings', async (req, res) => {
    const { firstName, lastName, email, organization, autoRecharge, lowCreditNotifications, sessionTimeout, twoFactorAuth, password } = req.body;
    try {
        let sql = `UPDATE users SET firstName=?, lastName=?, email=?, organization=?, 
                   autoRecharge=?, lowCreditNotifications=?, sessionTimeout=?, twoFactorAuth=?`;
        let params = [firstName, lastName, email, organization,
            autoRecharge ? 1 : 0, lowCreditNotifications ? 1 : 0,
            parseInt(sessionTimeout) || 30, twoFactorAuth ? 1 : 0];

        if (password && password.trim() !== '') {
            sql += `, password=?`;
            params.push(password);
        }

        sql += ` WHERE id=?`;
        params.push(req.params.id);

        await dbRun(sql, params);
        res.json({ success: true, message: 'Settings updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/user/:id/apiKey/regenerate', async (req, res) => {
    const newKey = 'ak_live_' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    try {
        await dbRun("UPDATE users SET apiKey=? WHERE id=?", [newKey, req.params.id]);
        res.json({ success: true, apiKey: newKey, message: 'API key regenerated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/user/:id/topup', async (req, res) => {
    const { amount } = req.body;
    try {
        await dbRun("UPDATE users SET credits = credits + ? WHERE id=?", [amount, req.params.id]);

        // Log transaction
        await dbRun(
            "INSERT INTO transactions (user_id, type, amount, description) VALUES (?, ?, ?, ?)",
            [req.params.id, 'topup', amount, `Wallet Top-up via Payment Gateway`]
        );

        res.json({ success: true, message: `Successfully added ₹${amount} to your wallet!` });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

app.post('/api/user/:id/topup-crypto', async (req, res) => {
    const { amount, txHash } = req.body;
    try {
        if (!txHash) return res.json({ success: false, message: 'Transaction hash is required' });

        // Check for duplicate
        const duplicateTx = await dbGet("SELECT id FROM transactions WHERE tx_hash=?", [txHash]);
        if (duplicateTx) return res.json({ success: false, message: 'Transaction already processed' });

        const verification = await verifyBlockchainTransaction(txHash);
        if (!verification.success) {
            return res.json({ success: false, message: verification.message });
        }

        await dbRun("UPDATE users SET credits = credits + ? WHERE id=?", [amount, req.params.id]);

        // Log transaction
        await dbRun(
            "INSERT INTO transactions (user_id, type, amount, description, tx_hash) VALUES (?, ?, ?, ?, ?)",
            [req.params.id, 'topup', amount, `Wallet Top-up via MetaMask`, txHash]
        );

        res.json({ success: true, message: `Successfully added ₹${amount} to your wallet via Crypto!` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/user/:id/subscription/upgrade', async (req, res) => {
    try {
        const user = await dbGet("SELECT credits FROM users WHERE id=?", [req.params.id]);
        if (!user || user.credits < 4999) {
            return res.json({ success: false, message: 'Insufficient Credits. Please top up your wallet.' });
        }

        await dbRun("UPDATE users SET credits = credits - 4999, subscription_tier = 'Pro Developer' WHERE id=?", [req.params.id]);

        // Log transaction
        await dbRun(
            "INSERT INTO transactions (user_id, type, amount, description) VALUES (?, ?, ?, ?)",
            [req.params.id, 'purchase', 4999, 'Pro Developer Plan Subscription']
        );

        res.json({ success: true, message: 'Successfully upgraded to Pro Developer Plan!' });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

/* =========================
   ADMIN DASHBOARD
========================= */

app.get('/api/admin/stats', async (req, res) => {
    try {

        const revenue = await dbGet(
            "SELECT SUM(amount) as total FROM transactions WHERE type='topup' OR tx_hash IS NOT NULL"
        );

        const users = await dbAll(`
            SELECT 
                u.id,
                u.firstName,
                u.lastName,
                u.email,
                u.role,
                u.status,
                u.credits,
                (SELECT COUNT(*) FROM user_apis WHERE user_id=u.id) as apiCount
            FROM users u
        `);

        res.json({
            revenue: revenue?.total || 0,
            totalUsers: users.length,
            allUsers: users
        });

    } catch (err) {
        res.json({ revenue: 0, totalUsers: 0, allUsers: [] });
    }
});

app.get('/api/admin/users/:id/apis', async (req, res) => {
    try {
        const apis = await dbAll(`
            SELECT a.id, a.name, a.category, ua.id as userApiId 
            FROM user_apis ua
            JOIN apis a ON ua.api_id = a.id
            WHERE ua.user_id = ?
        `, [req.params.id]);

        res.json({ success: true, activeApis: apis });
    } catch (err) {
        res.json({ success: false, activeApis: [], message: err.message });
    }
});

/* =========================
   ADMIN ACTIONS
========================= */

app.post('/api/admin/suspend', async (req, res) => {
    try {
        await dbRun(
            "UPDATE users SET status='suspended' WHERE id=?",
            [req.body.userId]
        );
        res.json({ success: true });
    } catch {
        res.json({ success: false });
    }
});

app.post('/api/admin/activate', async (req, res) => {
    try {
        await dbRun(
            "UPDATE users SET status='active' WHERE id=?",
            [req.body.userId]
        );
        res.json({ success: true });
    } catch {
        res.json({ success: false });
    }
});

/* =========================
   ADMIN GLOBAL CONFIG & MARKETPLACE
========================= */

app.get('/api/admin/config', async (req, res) => {
    try {
        const config = await dbGet("SELECT * FROM settings LIMIT 1");
        res.json({ success: true, config });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

app.post('/api/admin/config', async (req, res) => {
    const { userRateLimit, globalTrafficCap, maintenanceMode } = req.body;
    try {
        await dbRun(
            "UPDATE settings SET userRateLimit=?, globalTrafficCap=?, maintenanceMode=? WHERE id=1",
            [userRateLimit, globalTrafficCap, maintenanceMode ? 1 : 0]
        );
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

app.post('/api/admin/apis', async (req, res) => {
    const { name, provider, description, category, price, image } = req.body;
    try {
        await dbRun(
            "INSERT INTO apis (name, provider, description, category, price, image, status) VALUES (?,?,?,?,?,?,'active')",
            [name, provider, description, category, price, image]
        );
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

app.put('/api/admin/apis/:id', async (req, res) => {
    const { name, provider, description, category, price, image } = req.body;
    try {
        await dbRun(
            "UPDATE apis SET name=?, provider=?, description=?, category=?, price=?, image=? WHERE id=?",
            [name, provider, description, category, price, image, req.params.id]
        );
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

app.post('/api/admin/apis/:id/status', async (req, res) => {
    const { status } = req.body;
    try {
        await dbRun("UPDATE apis SET status=? WHERE id=?", [status, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

app.get('/api/admin/billing', async (req, res) => {
    try {
        const transactions = await dbAll(`
            SELECT t.id, t.type, t.amount, t.date, t.description, t.tx_hash, u.email as userEmail 
            FROM transactions t
            LEFT JOIN users u ON t.user_id = u.id
            ORDER BY t.date DESC
        `);

        let totalRevenue = 0;
        let count = 0;

        transactions.forEach(tx => {
            if (tx.type === 'purchase') {
                totalRevenue += tx.amount;
                count++;
            }
        });

        res.json({
            success: true,
            totalRevenue,
            avgTransaction: count > 0 ? (totalRevenue / count).toFixed(0) : 0,
            transactions
        });

    } catch (err) {
        res.json({ success: false, totalRevenue: 0, avgTransaction: 0, transactions: [] });
    }
});

/* =========================
   START SERVER
========================= */

const startServer = async () => {
  try {
    await connectMongo();
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  }
};

startServer();

module.exports = app;
