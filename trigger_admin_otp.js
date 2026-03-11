const http = require('http');

const adminEmail = 'admin@admin.com';
const adminPassword = 'admin';
const PORT = 3001; // According to server.js line 664

const postData = JSON.stringify({
    email: adminEmail,
    password: adminPassword
});

const options = {
    hostname: 'localhost',
    port: PORT,
    path: '/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log(`[Test] Attempting login for ${adminEmail}...`);

const req = http.request(options, (res) => {
    console.log(`[Test] Server Response Status: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const parsed = JSON.parse(data);
            console.log('[Test] Server Response Body:', parsed);

            if (parsed.success && parsed.requireOtp) {
                console.log('\n✅ Success: Credentials are valid.');
                console.log(`✅ Action: Server has triggered an OTP for ${adminEmail}.`);
                console.log('✅ Next Step: Check the terminal where server.js is running to see the OTP log.');
            } else {
                console.log('\n❌ Failed:', parsed.message || 'Unknown error');
            }
        } catch (e) {
            console.error('[Test] Error parsing response:', e.message);
            console.log('[Test] Raw data:', data);
        }
    });
});

req.on('error', (e) => {
    console.error(`[Test] Connection Error: ${e.message}`);
    console.log(`[Test] Make sure your server is running on port ${PORT}`);
});

req.write(postData);
req.end();
