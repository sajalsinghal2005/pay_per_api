/**
 * Email Templates - Formatted email content
 * Centralized email templates for consistency
 */

const getOTPEmailTemplate = (otp) => {
    return `
        <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0; padding: 30px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 28px; font-weight: 700;">🔐 API Hub</h1>
                <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Secure Verification</p>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px; padding: 30px;">
                <h2 style="color: #1f2937; margin-top: 0; font-size: 18px;">Identity Verification</h2>
                <p style="color: #4b5563; line-height: 1.6; margin: 15px 0;">
                    Use the following code to complete your action. This code is valid for <strong>5 minutes</strong>.
                </p>
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 6px; padding: 20px; margin: 25px 0;">
                    <div style="font-size: 32px; font-weight: 700; color: white; letter-spacing: 4px; text-align: center; font-family: 'Courier New', monospace;">
                        ${otp}
                    </div>
                </div>
                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 15px; border-radius: 4px; margin: 20px 0;">
                    <p style="margin: 0; color: #92400e; font-size: 14px;">
                        ⚠️ <strong>Never share this code</strong> with anyone, including API Hub staff.
                    </p>
                </div>
                <p style="color: #6b7280; font-size: 13px; margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                    If you didn't request this code, please ignore this email or contact support.
                </p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
                <p style="margin: 0;">© 2026 API Hub. All rights reserved.</p>
            </div>
        </div>
    `;
};

const getConfirmationEmailTemplate = (userName, apiName, credits) => {
    return `
        <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0; padding: 30px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 28px; font-weight: 700;">✅ Purchase Confirmed</h1>
                <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">API Hub Marketplace</p>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px; padding: 30px;">
                <h2 style="color: #1f2937; margin-top: 0; font-size: 18px;">Hello ${userName}! 👋</h2>
                <p style="color: #4b5563; line-height: 1.6; margin: 15px 0;">
                    Your API purchase has been confirmed successfully!
                </p>
                <div style="background: white; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #667eea;">📦 Order Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="border-bottom: 1px solid #e2e8f0;">
                            <td style="padding: 10px 0; color: #6b7280;">API:</td>
                            <td style="padding: 10px 0; color: #1f2937; font-weight: 600;">${apiName}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #e2e8f0;">
                            <td style="padding: 10px 0; color: #6b7280;">Credits Used:</td>
                            <td style="padding: 10px 0; color: #1f2937; font-weight: 600;">${credits}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #6b7280;">Date:</td>
                            <td style="padding: 10px 0; color: #1f2937; font-weight: 600;">${new Date().toLocaleDateString()}</td>
                        </tr>
                    </table>
                </div>
                <p style="color: #4b5563; line-height: 1.6; margin: 15px 0;">
                    You can now access <strong>${apiName}</strong> from your dashboard. Your API key has been generated automatically.
                </p>
                <div style="text-align: center; margin: 25px 0;">
                    <a href="#" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
                        Go to Dashboard →
                    </a>
                </div>
            </div>
        </div>
    `;
};

const getLowCreditAlertTemplate = (userName, currentCredits, threshold) => {
    return `
        <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px; padding: 20px;">
                <h2 style="color: #92400e; margin-top: 0;">⚠️ Low Credit Alert</h2>
                <p style="color: #92400e; margin: 10px 0;">
                    Hi ${userName}, your account credits have dropped below ${threshold}.
                </p>
                <p style="color: #92400e; margin: 10px 0;">
                    Current balance: <strong>${currentCredits} credits</strong>
                </p>
                <p style="color: #92400e; margin: 10px 0;">
                    Please top up your wallet to continue using APIs without interruption.
                </p>
                <a href="#" style="background: #f59e0b; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block; margin-top: 15px;">
                    Top Up Now →
                </a>
            </div>
        </div>
    `;
};

module.exports = {
    getOTPEmailTemplate,
    getConfirmationEmailTemplate,
    getLowCreditAlertTemplate
};
