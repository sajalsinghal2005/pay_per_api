const http = require('http');

async function testProxy() {
    console.log("--- Testing API Proxy System ---");

    const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/proxy/weather-cast',
        method: 'GET',
        headers: {}
    };

    // 1. Test missing API key
    console.log("\n1. Testing missing API key:");
    await new Promise((resolve) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                console.log("Status:", res.statusCode);
                console.log("Response:", data);
                resolve();
            });
        });
        req.on('error', (e) => {
            console.log("Error (is server running?):", e.message);
            resolve();
        });
        req.end();
    });

    // 2. Test invalid API key
    console.log("\n2. Testing invalid API key:");
    options.headers['x-api-key'] = 'invalid_key';
    await new Promise((resolve) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                console.log("Status:", res.statusCode);
                console.log("Response:", data);
                resolve();
            });
        });
        req.on('error', (e) => console.log("Error:", e.message));
        req.end();
    });

    console.log("\n--- Verification Hint ---");
    console.log("To fully test, you need to:");
    console.log("a) Set OPENWEATHER_API_KEY in .env");
    console.log("b) Purchase WeatherCast API in the dashboard to get a real ak_svc_xxxxx key");
    console.log("c) Call http://localhost:3001/api/proxy/weather-cast?city=Tokyo with that key in x-api-key header.");
}

testProxy();
