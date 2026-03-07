const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3001; // Using 3001 to avoid conflicts

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory storage for OTPs (Use a database for production)
// Structure: { email: { otp: "123456", expiresAt: timestamp } }
const otpStore = {};

/**
 * Configure Nodemailer Transporter
 * IMPORTANT: To send actual emails, replace the placeholder credentials below.
 * For Gmail, use an "App Password" (not your main password).
 */
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'sajalsinghal62650@gmail.com', // Updated with user email
        pass: 'Saja2005@'                 // Updated with user password
    }
});

// Helper function to generate a 6-digit random OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Route: Send OTP
 * Generates OTP, stores it, and sends it to the user's email.
 */
app.post('/send-otp', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes from now

    // Store OTP in memory
    otpStore[email] = { otp, expiresAt };

    // Email options
    const mailOptions = {
        from: '"OTP Verification" <no-reply@otp-system.com>',
        to: email,
        subject: 'Your 6-Digit OTP for Registration',
        text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
        html: `<h3>OTP Verification</h3>
               <p>Your OTP is: <strong>${otp}</strong></p>
               <p>This OTP will expire in 5 minutes.</p>`
    };

    try {
        // Log OTP to console for testing without active email credentials
        console.log(`[TEST] OTP for ${email}: ${otp}`);

        // Send actual emails
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({ message: 'Failed to send OTP' });
    }
});

/**
 * Route: Verify OTP
 * Checks if the provided OTP matches the stored OTP and hasn't expired.
 */
app.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const record = otpStore[email];

    if (!record) {
        return res.status(400).json({ message: 'No OTP found for this email' });
    }

    if (Date.now() > record.expiresAt) {
        delete otpStore[email]; // Clean up expired OTP
        return res.status(410).json({ message: 'OTP expired' });
    }

    if (record.otp === otp) {
        delete otpStore[email]; // Clear OTP after successful verification
        res.status(200).json({ message: 'OTP verified' });
    } else {
        res.status(400).json({ message: 'Incorrect OTP' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`OTP Server running at http://localhost:${PORT}`);
    console.log(`NOTE: Check this console for OTPs during testing if you haven't set email credentials.`);
});
