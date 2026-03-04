const http = require('http');

// first ensure the test user exists by attempting registration
const regData = JSON.stringify({
    firstName: 'Test',
    lastName: 'User',
    email: 'test@test.com',
    contact: '1234567890',
    password: 'password'
});

const regOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(regData)
    }
};

// after registration (or if already registered) we perform login
const postData = JSON.stringify({
    email: 'test@test.com',
    password: 'password'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

// function to perform login (and then resend)
function doLogin() {
    const req = http.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        res.setEncoding('utf8');
        let responseBody = '';
        res.on('data', (chunk) => {
            responseBody += chunk;
            console.log(`BODY: ${chunk}`);
        });
        res.on('end', () => {
            console.log('No more data in response.');
            try {
                const data = JSON.parse(responseBody);
                if (data.userId) {
                    // try resend OTP
                    const resendData = JSON.stringify({ userId: data.userId });
                    const resendOptions = {
                        hostname: 'localhost',
                        port: 3000,
                        path: '/api/auth/resend-otp',
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Content-Length': Buffer.byteLength(resendData)
                        }
                    };
                    const resendReq = http.request(resendOptions, (res2) => {
                        console.log(`RESEND STATUS: ${res2.statusCode}`);
                        res2.setEncoding('utf8');
                        res2.on('data', (chunk) => {
                            console.log(`RESEND BODY: ${chunk}`);
                        });
                    });
                    resendReq.on('error', (e) => {
                        console.error(`problem with resend request: ${e.message}`);
                    });
                    resendReq.write(resendData);
                    resendReq.end();
                }
            } catch (e) {
                console.error('Error parsing login response', e);
            }
        });
    });

    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });

    // Write data to request body
    req.write(postData);
    req.end();
}

// first send registration, ignore result, then login
const regReq = http.request(regOptions, (regRes) => {
    regRes.setEncoding('utf8');
    regRes.on('data', (chunk) => {
        console.log('REGISTER BODY:', chunk);
    });
    regRes.on('end', () => {
        // after registration attempt, proceed to login
        doLogin();
    });
});
regReq.on('error', (e) => {
    console.error(`problem with registration request: ${e.message}`);
});
regReq.write(regData);
regReq.end();
