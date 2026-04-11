/**
 * OTP Utilities - Generation and validation
 * Handles 6-digit OTP generation and expiration
 */

// In-memory OTP storage (can be replaced with Redis for production)
const otpStore = {};

/**
 * Generate random 6-digit OTP
 * @returns {string} 6-digit OTP code
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Store OTP for email with expiration
 * @param {string} email - User email
 * @param {number} expiryMinutes - Expiration time in minutes (default: 5)
 * @returns {object} { otp: string, email: string, expiresAt: number }
 */
const storeOTP = (email, expiryMinutes = 5) => {
    const otp = generateOTP();
    const expiresAt = Date.now() + expiryMinutes * 60 * 1000;
    otpStore[email] = { otp, expiresAt };
    return { otp, email, expiresAt };
};

/**
 * Verify OTP for email
 * @param {string} email - User email
 * @param {string} otp - OTP to verify
 * @returns {object} { success: boolean, message: string }
 */
const verifyOTP = (email, otp) => {
    const record = otpStore[email];

    if (!record) {
        return { success: false, message: 'OTP expired or not requested' };
    }

    if (Date.now() > record.expiresAt) {
        delete otpStore[email];
        return { success: false, message: 'OTP has expired' };
    }

    if (record.otp !== otp) {
        return { success: false, message: 'Invalid OTP code' };
    }

    // OTP verified successfully
    delete otpStore[email]; // Clear after successful verification
    return { success: true, message: 'OTP verified successfully' };
};

/**
 * Clear OTP for email
 * @param {string} email - User email
 */
const clearOTP = (email) => {
    delete otpStore[email];
};

/**
 * Get OTP information (for debugging)
 * @param {string} email - User email
 * @returns {object} OTP record or null
 */
const getOTPInfo = (email) => {
    return otpStore[email] || null;
};

module.exports = {
    generateOTP,
    storeOTP,
    verifyOTP,
    clearOTP,
    getOTPInfo
};
