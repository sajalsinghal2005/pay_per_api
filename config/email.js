/**
 * Email Configuration with Nodemailer
 * Handles SMTP setup and email sending
 */

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,   // 10 seconds
    socketTimeout: 15000      // 15 seconds
});

// Verify SMTP configuration at startup (non-blocking)
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter.verify((err, success) => {
        if (err) {
            console.warn('[Email] ⚠️ SMTP verification failed:', err.message);
            console.warn('[Email] Update .env with valid EMAIL_USER and EMAIL_PASS');
        } else {
            console.log('[Email] ✓ SMTP connection verified');
        }
    });
} else {
    console.warn('[Email] ⚠️ EMAIL_USER or EMAIL_PASS not configured in .env');
    console.warn('[Email] Email features will not work. Update .env for production.');
}

/**
 * Send email helper
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 */
const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"API Hub Support" <${process.env.EMAIL_USER || 'sajalsinghal62650@gmail.com'}>`,
            to,
            subject,
            html
        });
        console.log(`[Email] Sent to ${to}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('[Email] Send failed:', error.message);
        return { success: false, error: error.message };
    }
};

module.exports = {
    transporter,
    sendEmail
};
