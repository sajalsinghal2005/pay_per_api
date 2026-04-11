/**
 * Request Validators - Input validation helpers
 * Validates common request patterns
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Valid email format
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} { valid: boolean, message: string }
 */
const isValidPassword = (password) => {
    if (!password || password.length < 6) {
        return { valid: false, message: 'Password must be at least 6 characters' };
    }
    return { valid: true, message: 'Password is valid' };
};

/**
 * Validate API key format
 * @param {string} apiKey - API key to validate
 * @returns {boolean} Valid API key format
 */
const isValidAPIKey = (apiKey) => {
    return apiKey && apiKey.startsWith('ak_') && apiKey.length > 20;
};

/**
 * Validate credit amount
 * @param {number} credits - Credit amount to validate
 * @returns {boolean} Valid credit amount
 */
const isValidCreditAmount = (credits) => {
    return Number.isInteger(credits) && credits > 0 && credits <= 1000000;
};

/**
 * Sanitize user input to prevent XSS
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return '';
    return input
        .replace(/[<>]/g, '')
        .trim()
        .substring(0, 255);
};

/**
 * Validate user registration input
 * @param {object} data - Registration data
 * @returns {object} { valid: boolean, errors: array }
 */
const validateRegistration = (data) => {
    const errors = [];

    if (!data.firstName || data.firstName.trim().length === 0) {
        errors.push('First name is required');
    }
    if (!data.lastName || data.lastName.trim().length === 0) {
        errors.push('Last name is required');
    }
    if (!isValidEmail(data.email)) {
        errors.push('Invalid email format');
    }
    const passwordCheck = isValidPassword(data.password);
    if (!passwordCheck.valid) {
        errors.push(passwordCheck.message);
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

module.exports = {
    isValidEmail,
    isValidPassword,
    isValidAPIKey,
    isValidCreditAmount,
    sanitizeInput,
    validateRegistration
};
