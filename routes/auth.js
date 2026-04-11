/**
 * Authentication Routes
 * POST /register - Register new user
 * POST /login - Login user
 * POST /forgot-password - Request password reset
 * POST /reset-password - Reset password with email and new password
 */

const express = require('express');
const router = express.Router();
const { dbGet, dbRun } = require('../config/database');
const { sendEmail } = require('../config/email');
const { isValidEmail, isValidPassword, validateRegistration } = require('../utils/validators');

/**
 * POST /register
 * Register new user - creates account immediately
 */
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, contact, password } = req.body;

        // Validate input
        const validation = validateRegistration({ firstName, lastName, email, password });
        if (!validation.valid) {
            return res.status(400).json({ 
                success: false, 
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        // Check if user already exists
        const existingUser = await dbGet("SELECT id FROM users WHERE email=?", [email]);
        if (existingUser) {
            return res.status(409).json({ 
                success: false, 
                message: 'Email already registered' 
            });
        }

        // Generate API key
        const apiKey = 'ak_live_' + Math.random().toString(36).substring(2);

        // Insert user directly
        await dbRun(
            `INSERT INTO users (firstName, lastName, email, contact, password, role, status, apiKey, credits) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [firstName, lastName, email, contact, password, 'user', 'active', apiKey, 500]
        );

        console.log(`[Auth] ✓ User registered: ${email}`);

        res.json({ 
            success: true, 
            message: 'Registration successful. You can now login.' 
        });

    } catch (error) {
        console.error('[Auth] Register error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Registration failed. Please try again.' 
        });
    }
});

/**
 * POST /login
 * Login user with email and password
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and password are required' 
            });
        }

        // Find user and fetch all data
        const user = await dbGet(
            "SELECT id, firstName, lastName, email, password, role, status, apiKey, credits, contact FROM users WHERE email=?",
            [email]
        );

        if (!user || user.password !== password) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        if (user.status === 'suspended') {
            return res.status(403).json({ 
                success: false, 
                message: 'Account suspended. Contact support.' 
            });
        }

        console.log(`[Auth] ✓ Login successful: ${email}`);

        // Return full user data directly
        res.json({ 
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                contact: user.contact,
                role: user.role,
                apiKey: user.apiKey,
                credits: user.credits
            }
        });

    } catch (error) {
        console.error('[Auth] Login error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Login failed' 
        });
    }
});

/**
 * POST /forgot-password
 * Request password reset - user will enter new password
 */
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !isValidEmail(email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Valid email is required' 
            });
        }

        // Check if user exists
        const user = await dbGet("SELECT id, firstName FROM users WHERE email=?", [email]);
        if (!user) {
            // Don't reveal if email exists (security)
            return res.json({ 
                success: true, 
                message: 'If account exists, you can reset your password' 
            });
        }

        console.log(`[Auth] ✓ Forgot password requested for: ${email}`);

        res.json({ 
            success: true, 
            message: 'You can reset your password now',
            userId: user.id,
            userName: user.firstName
        });

    } catch (error) {
        console.error('[Auth] Forgot password error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Request failed' 
        });
    }
});

/**
 * POST /reset-password
 * Reset password - requires email and new password
 */
router.post('/reset-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and new password are required' 
            });
        }

        // Validate password
        const passwordCheck = isValidPassword(newPassword);
        if (!passwordCheck.valid) {
            return res.status(400).json({ 
                success: false, 
                message: passwordCheck.message 
            });
        }

        // Find and update user
        const user = await dbGet("SELECT id FROM users WHERE email=?", [email]);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        await dbRun(
            "UPDATE users SET password=? WHERE id=?",
            [newPassword, user.id]
        );

        console.log(`[Auth] ✓ Password reset: ${email}`);

        res.json({ 
            success: true, 
            message: 'Password updated successfully. Please login with your new password.' 
        });

    } catch (error) {
        console.error('[Auth] Reset password error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Password reset failed' 
        });
    }
});

/**
 * POST /login-metamask
 * Login user with MetaMask wallet address
 */
router.post('/login-metamask', async (req, res) => {
    try {
        const { walletAddress } = req.body;

        if (!walletAddress) {
            return res.status(400).json({ 
                success: false, 
                message: 'Wallet address is required' 
            });
        }

        // Normalize wallet address (to lowercase for case-insensitive lookup)
        const normalizedAddress = walletAddress.toLowerCase();

        // Find user by wallet address
        const user = await dbGet(
            "SELECT id, firstName, lastName, email, role, status, apiKey, credits, contact FROM users WHERE LOWER(walletAddress)=?",
            [normalizedAddress]
        );

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Wallet not linked to any account. Please sign up first and link your wallet.' 
            });
        }

        if (user.status !== 'active') {
            return res.status(403).json({ 
                success: false, 
                message: 'Account is not active' 
            });
        }

        console.log(`[Auth] ✓ MetaMask login: ${normalizedAddress} (${user.email})`);

        res.json({ 
            success: true,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                contact: user.contact,
                role: user.role,
                apiKey: user.apiKey,
                credits: user.credits,
                walletAddress: walletAddress
            }
        });

    } catch (error) {
        console.error('[Auth] MetaMask login error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

/**
 * POST /api/auth/login-confirm
 * Get user data after OTP verification
 */
router.post('/api/auth/login-confirm', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email is required' 
            });
        }

        // Fetch full user data
        const user = await dbGet(
            "SELECT id, firstName, lastName, email, role, status, apiKey, credits, contact FROM users WHERE email=?",
            [email]
        );

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        if (user.status !== 'active') {
            return res.status(403).json({ 
                success: false, 
                message: 'Account is not active' 
            });
        }

        console.log(`[Auth] ✓ User logged in: ${email}`);

        res.json({ 
            success: true,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                contact: user.contact,
                role: user.role,
                apiKey: user.apiKey,
                credits: user.credits
            }
        });

    } catch (error) {
        console.error('[Auth] Login confirm error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

module.exports = router;
