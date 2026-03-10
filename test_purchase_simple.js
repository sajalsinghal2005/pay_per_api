const http = require('http');
const sqlite3 = require('sqlite3').verbose();

// Direct database access for test user creation
const db = new sqlite3.Database('app.db');

function postRequest(path, data) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve(JSON.parse(body)));
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

function getRequest(path) {
    return new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:3001${path}`, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve(JSON.parse(body)));
        });
        req.on('error', reject);
    });
}

async function runTest() {
    try {
        // Create test user directly in database
        const testEmail = 'testbuyer' + Math.floor(Math.random() * 10000) + '@test.com';
        
        await new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO users (firstName, lastName, email, password, role, credits, status, apiKey)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                ['Test', 'Buyer', testEmail, 'password123', 'user', 5000, 'active', 'ak_test_key'],
                function(err) {
                    if (err) reject(err);
                    else {
                        resolve(this.lastID);
                    }
                }
            );
        });

        // Get the user ID we just created
        const userId = await new Promise((resolve, reject) => {
            db.get("SELECT id FROM users WHERE email = ?", [testEmail], (err, row) => {
                if (err) reject(err);
                else resolve(row.id);
            });
        });

        console.log(`✅ Test User Created (ID: ${userId}, Email: ${testEmail})`);

        console.log("\n2. Listing APIs...");
        const apis = await getRequest('/api/apis');
        console.log(`✅ Found ${apis.length} APIs.`);
        const apiToBuy = apis[0];
        console.log(`   API to Buy: ${apiToBuy.name} (ID: ${apiToBuy.id}, Price: ${apiToBuy.price} credits)`);

        console.log("\n3. Checking Initial Credits...");
        let dashboard = await getRequest(`/api/user/${userId}/dashboard`);
        console.log(`✅ Initial Credits: ${dashboard.credits}`);

        console.log("\n4. Purchasing API...");
        const purchase = await postRequest('/api/apis/purchase', {
            userId: userId, 
            apiId: apiToBuy.id
        });
        console.log("Purchase Result:", purchase);
        
        if (!purchase.success) {
            throw new Error(`Purchase failed: ${purchase.message}`);
        }
        console.log(`✅ API Purchased Successfully! API Key: ${purchase.api_key}`);

        console.log("\n5. Verifying Dashboard After Purchase...");
        dashboard = await getRequest(`/api/user/${userId}/dashboard`);
        console.log(`✅ New Credits: ${dashboard.credits}`);
        const active = dashboard.activeApis.find(a => a.name === apiToBuy.name);
        console.log(`✅ Active API Found: ${!!active}`);

        console.log("\n6. Verifying Transactions...");
        const transactions = await getRequest(`/api/user/${userId}/billing`);
        console.log(`✅ Transactions found: ${transactions.length}`);
        if (transactions.length > 0) {
            console.log(`   Last Transaction: ${JSON.stringify(transactions[0])}`);
        }

        console.log("\n" + "=".repeat(50));
        console.log("🎉 TEST COMPLETED SUCCESSFULLY!");
        console.log("=".repeat(50));
        
        db.close();
        process.exit(0);

    } catch (err) {
        console.error("\n❌ TEST FAILED:", err.message);
        db.close();
        process.exit(1);
    }
}

runTest();
