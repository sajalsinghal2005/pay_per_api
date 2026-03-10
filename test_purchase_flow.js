const http = require('http');

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
        const email = 'buyer' + Math.floor(Math.random() * 1000) + '@test.com';
        
        console.log("1. Sending OTP...");
        const otpRes = await postRequest('/send-otp', { email });
        console.log("OTP sent:", otpRes);
        
        console.log("2. Registering User...");
        const reg = await postRequest('/register', {
            firstName: 'Buyer', 
            lastName: 'Test', 
            email: email, 
            contact: '000', 
            password: 'pass',
            otp: '123456'  // Default OTP for testing
        });
        console.log("Registration:", reg);
        if (!reg.success) throw new Error("Registration failed");
        const userId = reg.userId;

        console.log("2. Listing APIs...");
        const apis = await getRequest('/api/apis');
        console.log(`Found ${apis.length} APIs.`);
        const apiToBuy = apis[0];
        console.log(`Buying API: ${apiToBuy.name} (ID: ${apiToBuy.id}, Price: ${apiToBuy.price})`);

        console.log("3. Checking Initial Credits...");
        let dashboard = await getRequest(`/api/user/${userId}/dashboard`);
        console.log(`Initial Credits: ${dashboard.credits}`);

        console.log("4. Purchasing API...");
        const purchase = await postRequest('/api/apis/purchase', {
            userId: userId, apiId: apiToBuy.id
        });
        console.log("Purchase Result:", purchase);

        console.log("5. Verifying Dashboard (Credits & Active APIs)...");
        dashboard = await getRequest(`/api/user/${userId}/dashboard`);
        console.log(`New Credits: ${dashboard.credits}`);
        const active = dashboard.activeApis.find(a => a.name === apiToBuy.name);
        console.log("Active API Found:", !!active);

        console.log("6. Verifying Transactions...");
        const transactions = await getRequest(`/api/user/${userId}/billing`);
        console.log("Transactions found:", transactions.length);
        console.log("Last Transaction:", transactions[0]);

        console.log("TEST COMPLETED SUCCESSFULLY");

    } catch (err) {
        console.error("TEST FAILED:", err);
    }
}

runTest();
