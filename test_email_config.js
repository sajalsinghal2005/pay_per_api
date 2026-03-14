const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.GMAIL_USER || 'placeholder@gmail.com',
        pass: process.env.GMAIL_APP_PASS || 'placeholder'
    }
});

console.log("Checking transporter configuration...");
console.log("Host:", transporter.options.host);
console.log("Port:", transporter.options.port);
console.log("Secure:", transporter.options.secure);

// Test if it can at least parse the config
if (transporter.options.port === 465 && transporter.options.secure === true) {
    console.log("✅ Configuration looks correct for SSL/TLS on port 465.");
} else {
    console.error("❌ Configuration mismatch detected.");
}
