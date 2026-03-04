const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

/* =========================
   DB HELPERS
========================= */

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
            else resolve(rows);
        });
    });

/* =========================
   AUTH
========================= */

app.post('/api/auth/register', async (req, res) => {
    const { firstName, lastName, email, contact, password } = req.body;
    const apiKey = 'ak_live_' + Math.random().toString(36).substring(2);

    try {
        await dbRun(
            `INSERT INTO users
            (firstName,lastName,email,contact,password,role,status,apiKey)
            VALUES(?,?,?,?,?,?,?,?)`,
            [firstName, lastName, email, contact, password, 'user', 'active', apiKey]
        );

        res.json({ success: true });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await dbGet(
            "SELECT * FROM users WHERE email=? AND password=?",
            [email, password]
        );

        if (!user)
            return res.json({ success: false, message: 'Invalid credentials' });

        if (user.status === 'suspended')
            return res.json({ success: false, message: 'Account Suspended' });

        res.json({ success: true, user });

    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

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

        await dbRun(
            "INSERT INTO user_apis(user_id,api_id) VALUES(?,?)",
            [userId, apiId]
        );

        await dbRun(
            "UPDATE users SET credits=credits-? WHERE id=?",
            [api.price, userId]
        );

        await dbRun(
            "INSERT INTO transactions(user_id,type,amount,description) VALUES(?,?,?,?)",
            [userId, 'purchase', api.price, `Purchased ${api.name}`]
        );

        res.json({ success: true, message: 'API Purchased Successfully' });

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
            SELECT a.id as apiId, a.name, a.category, ua.id as userApiId
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
        const datasets = apis.map((api, index) => {
            // Generate some realistic dummy data for 7 days based on the API ID
            const baseTraffic = (api.id * 1200) + 500;
            const data = Array.from({ length: 7 }, () => Math.floor(baseTraffic + (Math.random() * 2000)));

            return {
                label: api.name,
                data: data,
                backgroundColor: colors[index % colors.length],
                borderRadius: 4,
            };
        });

        res.json({ success: true, datasets });

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
            "SELECT SUM(amount) as total FROM transactions WHERE type='topup'"
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
            SELECT t.id, t.type, t.amount, t.date, u.email as userEmail 
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

app.listen(3000, () =>
    console.log("Server running on http://localhost:3000")
);