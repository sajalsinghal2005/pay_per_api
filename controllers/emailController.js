const nodemailer = require('nodemailer');

// Initialize transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'sajalsinghal62650@gmail.com',
        pass: process.env.EMAIL_PASS || 'mbexkymmjmukocsz'
    }
});

/**
 * Send email
 */
async function sendEmail(req, res) {
    try {
        const { to, subject, template, variables } = req.body;

        // Validate required fields
        if (!to || !subject) {
            return res.status(400).json({
                success: false,
                message: 'to and subject are required'
            });
        }

        // Simple HTML template rendering
        let htmlContent = template || '<p>No content</p>';
        
        if (variables) {
            Object.forEach((key, value) => {
                htmlContent = htmlContent.replace(`{{${key}}}`, value);
            });
        }

        // Send email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            html: htmlContent
        };

        const info = await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            data: {
                message_id: info.messageId,
                to,
                subject,
                sent_at: new Date().toISOString()
            }
        });
    } catch (err) {
        console.error('[Email Error]:', err.message);
        res.status(500).json({
            success: false,
            message: 'Email sending failed',
            error: err.message
        });
    }
}

/**
 * Send bulk emails
 */
async function sendBulkEmails(req, res) {
    try {
        const { recipients, subject, template } = req.body;

        if (!recipients || !Array.isArray(recipients)) {
            return res.status(400).json({
                success: false,
                message: 'recipients array is required'
            });
        }

        const results = [];
        for (const recipient of recipients) {
            try {
                const info = await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: recipient.email,
                    subject,
                    html: template
                });
                results.push({ email: recipient.email, success: true, message_id: info.messageId });
            } catch (err) {
                results.push({ email: recipient.email, success: false, error: err.message });
            }
        }

        const successful = results.filter(r => r.success).length;

        res.json({
            success: true,
            data: {
                total: recipients.length,
                successful,
                failed: recipients.length - successful,
                results
            }
        });
    } catch (err) {
        console.error('[Bulk Email Error]:', err.message);
        res.status(500).json({
            success: false,
            message: 'Bulk email sending failed',
            error: err.message
        });
    }
}

module.exports = {
    sendEmail,
    sendBulkEmails
};
