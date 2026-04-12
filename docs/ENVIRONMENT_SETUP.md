# Environment Variables Setup Guide

Complete guide for configuring all environment variables needed to run API Hub locally.

## 📝 What is `.env`?

The `.env` file stores **sensitive configuration** that should NOT be in code:
- API keys and passwords
- Database paths
- Wallet addresses
- Feature flags

### Security Rules:
- ✅ Create `.env` locally on your machine
- ❌ NEVER commit `.env` to Git
- ✅ Use `.env.example` as template
- ❌ NEVER share `.env` with others
- ✅ Each team member has their own `.env`

---

## 🚀 Step 1: Create `.env` File

```bash
# Navigate to project root
cd c:\SUBODH_COLLEGE

# Copy example file to create your .env
cp .env.example .env

# Edit .env with your favorite editor
# Windows: notepad .env
# Mac/Linux: nano .env
# VS Code: code .env
```

---

## 🔐 Step 2: Configure Each Variable

Below is the complete configuration guide for each variable:

### SERVER CONFIGURATION

#### `PORT`
- **Purpose:** Which port the server runs on
- **Default:** 3001
- **Format:** Number only
- **Example:** `PORT=3001`
- **Notes:** Must be unique (if already in use, try 3002, 3003, etc.)

#### `NODE_ENV`
- **Purpose:** Tells Node.js which environment we're in
- **Options:** 
  - `development` - For local development (verbose logging)
  - `production` - For deployed apps (minimal logging)
  - `test` - For automated tests
- **Default:** development
- **Example:** `NODE_ENV=development`

---

### EMAIL CONFIGURATION

**Purpose:** Send OTP verification codes and email notifications

#### `EMAIL_USER`
- **Purpose:** Your Gmail email address
- **Format:** Valid email address
- **Example:** `EMAIL_USER=john.doe@gmail.com`
- **Steps to Get:**
  1. Use your personal Gmail account
  2. Just enter your email here
  3. No special characters needed

#### `EMAIL_PASS`
- **Purpose:** Gmail App Password (NOT regular password)
- **Format:** 16 characters (from Google)
- **Example:** `EMAIL_PASS=abcdlmnopqrstuv`

⚠️ **IMPORTANT:** This is NOT your regular Gmail password!

**How to Get Gmail App Password:**

1. **Enable 2-Step Verification:**
   - Go to: https://myaccount.google.com
   - Click "Security" (left sidebar)
   - Scroll to "2-Step Verification"
   - Click "Get started"
   - Add phone number
   - Verify code sent to phone
   - Save recovery codes in safe place

2. **Generate App Password:**
   - After 2FA is enabled, go to: https://myaccount.google.com/apppasswords
   - You'll see a dropdown menu
   - Select:
     - App: **Mail**
     - Device: **Windows Computer** (or your OS)
   - Click "Generate"
   - Google shows: `xxxx xxxx xxxx xxxx`

3. **Add to .env:**
   ```
   EMAIL_PASS=xxxxxxxxxxxxxxxx
   ```
   (Remove the spaces!)

**Test Email:**
```bash
node test_email_config.js
```

---

### DATABASE CONFIGURATION

#### `DATABASE_PATH`
- **Purpose:** Where SQLite stores data
- **Default:** `./app.db` (current directory)
- **Format:** File path (relative or absolute)
- **Examples:**
  ```
  DATABASE_PATH=./app.db          # Current directory
  DATABASE_PATH=/data/app.db      # Absolute path
  DATABASE_PATH=d:/myapp/app.db  # Windows absolute path
  ```
- **Notes:**
  - File will be auto-created if doesn't exist
  - Keep it simple (same directory as server.js)

**View Database Contents:**
```bash
sqlite3 app.db
.tables              # Shows all tables
SELECT * FROM users; # View all users
.exit               # Exit sqlite3
```

---

### BLOCKCHAIN CONFIGURATION

**Purpose:** Test cryptocurrency payments (testnet only, no real money)

#### `MONAD_RPC_URL`
- **Purpose:** Connection to Monad test blockchain
- **Default:** `https://testnet-rpc.monad.xyz/`
- **Format:** HTTPS URL
- **Example:** `MONAD_RPC_URL=https://testnet-rpc.monad.xyz/`
- **Notes:** Don't change this unless instructed

#### `WALLET_ADDRESS`
- **Purpose:** Your crypto wallet address (for receiving test payments)
- **Format:** 42 characters starting with `0x`
- **Example:** `WALLET_ADDRESS=0x1234567890123456789012345678901234567890`

**How to Get Wallet Address:**

1. **Install MetaMask:**
   - Go to: https://metamask.io
   - Click "Download"
   - Select your browser
   - Click "Install"

2. **Create Wallet:**
   - Click MetaMask extension
   - Click "Create a new wallet"
   - Create strong password
   - Save seed phrase (12 words) in safe place

3. **Add Monad Testnet Network:**
   - Click network dropdown (says "Ethereum Mainnet")
   - Click "Add a custom network manually"
   - Fill in:
     ```
     Network name: Monad Testnet
     RPC URL: https://testnet-rpc.monad.xyz/
     Chain ID: 10143
     Currency symbol: MON
     Block explorer: https://testnet-explorer.monad.xyz/
     ```
   - Click "Save"

4. **Switch to Monad Testnet:**
   - Click network dropdown
   - Select "Monad Testnet"

5. **Copy Your Address:**
   - Click account name (top)
   - Click "Copy account address"
   - Paste into `.env`:
     ```
     WALLET_ADDRESS=0xPastedAddressHere
     ```

6. **Get Test Tokens (Optional):**
   - Go to: https://testnet-faucet.monad.xyz/
   - Paste your wallet address
   - Click "Get tokens"
   - You'll receive free test MON (testing only!)

---

### SESSION & SECURITY CONFIGURATION

#### `SESSION_TIMEOUT`
- **Purpose:** How long before user session expires
- **Format:** Number (minutes)
- **Default:** 30
- **Example:** `SESSION_TIMEOUT=30`
- **Notes:** User must login again after timeout

#### `JWT_SECRET`
- **Purpose:** Secret key for signing authentication tokens
- **Format:** Random string (long!)
- **Default:** `your-super-secret-key-change-this-in-production-12345`

⚠️ **IMPORTANT:** Change this for production!

**Generate Random Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy output and paste into `.env`:
```
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z
```

---

### REAL API INTEGRATIONS

#### `WEATHER_API_KEY`
- **Purpose:** Fetch real weather data (paid feature - free tier available)
- **Format:** 25-40 character key
- **Optional:** Leave empty if not using weather API
- **Example:** `WEATHER_API_KEY=abc123def456ghi789`

**How to Get:**

1. Visit: https://openweathermap.org/api
2. Click "Sign Up"
3. Create free account (no credit card needed!)
4. Confirm email
5. Go to: https://home.openweathermap.org/api_keys
6. Copy your "Default" API key
7. Paste into `.env`:
   ```
   WEATHER_API_KEY=your_api_key_here
   ```

**Test:**
```bash
npm run dev
curl "http://localhost:3001/api/weather?city=london"
```

---

### FEATURE FLAGS

#### `ENABLE_2FA`
- **Purpose:** Enable Two-Factor Authentication
- **Options:** true or false
- **Example:** `ENABLE_2FA=true`

#### `ENABLE_CRYPTO_PAYMENTS`
- **Purpose:** Enable cryptocurrency payment option
- **Options:** true or false
- **Example:** `ENABLE_CRYPTO_PAYMENTS=true`

#### `ENABLE_EMAIL_NOTIFICATIONS`
- **Purpose:** Send email notifications
- **Options:** true or false
- **Example:** `ENABLE_EMAIL_NOTIFICATIONS=true`

---

## 📋 Complete `.env` Template

Here's a filled `.env` file example:

```env
# ========================================
# SERVER CONFIGURATION
# ========================================
PORT=3001
NODE_ENV=development

# ========================================
# EMAIL CONFIGURATION
# ========================================
EMAIL_USER=john.doe@gmail.com
EMAIL_PASS=abcdlmnopqrstuv

# ========================================
# DATABASE CONFIGURATION
# ========================================
DATABASE_PATH=./app.db

# ========================================
# BLOCKCHAIN CONFIGURATION
# ========================================
MONAD_RPC_URL=https://testnet-rpc.monad.xyz/
WALLET_ADDRESS=0x1234567890123456789012345678901234567890

# ========================================
# SESSION & SECURITY
# ========================================
SESSION_TIMEOUT=30
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z

# ========================================
# REAL API INTEGRATIONS
# ========================================
WEATHER_API_KEY=abc123def456ghi789

# ========================================
# FEATURE FLAGS
# ========================================
ENABLE_2FA=true
ENABLE_CRYPTO_PAYMENTS=true
ENABLE_EMAIL_NOTIFICATIONS=true
```

---

## 🧪 Verify Configuration

### Test 1: Email Service

```bash
node test_email_config.js
```

Expected output:
```
✓ Email service initialized
✓ Credentials verified
✓ Ready to send OTP
```

### Test 2: Database Connection

```bash
sqlite3 app.db ".tables"
```

Expected: Shows list of tables (users, apis, transactions)

### Test 3: Server Starts

```bash
npm run dev
```

Expected: Server starts on configured PORT without errors

### Test 4: Weather API (if configured)

```bash
curl "http://localhost:3001/api/weather?city=london"
```

Expected: JSON response with weather data

---

## 🐛 Common Configuration Errors

### Error: "Invalid email credentials"
```
Problem: EMAIL_USER or EMAIL_PASS incorrect
Solution:
  1. Check EMAIL_USER matches your Gmail account
  2. Verify EMAIL_PASS is app password, not regular password
  3. Check for extra spaces in app password
  4. Regenerate app password (1 hour wait)
```

### Error: "Cannot connect to database"
```
Problem: DATABASE_PATH doesn't exist or is invalid
Solution:
  1. Use relative path: ./app.db
  2. Check directory permissions
  3. Ensure path is not a directory
```

### Error: "RPC connection failed"
```
Problem: MONAD_RPC_URL is unreachable
Solution:
  1. Check internet connection
  2. Verify URL is correct
  3. Check if Monad testnet is offline
  4. Try faucet: https://testnet-faucet.monad.xyz/
```

### Error: "Port already in use"
```
Problem: Another app running on same PORT
Solution:
  1. Change PORT in .env to 3002, 3003, etc.
  2. Or kill the process: npx kill-port 3001
```

---

## 🔒 Security Best Practices

### ✅ DO:
- Create unique `.env` for each environment (local, staging, prod)
- Use strong JWT_SECRET (at least 32 characters)
- Store `.env` in `.gitignore` (already done)
- Regenerate email password if compromised
- Use separate email account for testing vs production
- Rotate secrets regularly

### ❌ DON'T:
- Commit `.env` to Git
- Share `.env` file via email or chat
- Use same JWT_SECRET in production as development
- Hardcode secrets in code
- Use "password123" as JWT_SECRET
- Store `.env` in public repositories
- Log sensitive values to console

---

## 📚 Environment by Use Case

### Local Development
```env
NODE_ENV=development
PORT=3001
DATABASE_PATH=./app.db
ENABLE_2FA=false
ENABLE_EMAIL_NOTIFICATIONS=false
```

### Testing
```env
NODE_ENV=test
PORT=3001
DATABASE_PATH=./test.db
ENABLE_2FA=false
ENABLE_EMAIL_NOTIFICATIONS=false
```

### Production (Railway/Heroku)
```env
NODE_ENV=production
PORT=3001
DATABASE_PATH=/app/data/app.db
ENABLE_2FA=true
ENABLE_EMAIL_NOTIFICATIONS=true
```

---

## 🔄 Updating Environment Variables

### During Development

1. Edit `.env` file
2. Restart server: `npm run dev` (Ctrl+C and run again)
3. Changes take effect immediately

### In Production

1. Update variables in deployment platform (Railway, Heroku, etc.)
2. Restart application
3. Changes take effect on next request

---

## 📞 Troubleshooting Checklist

If something isn't working:

1. **Check .env exists:**
   ```bash
   ls -la .env  # or dir .env on Windows
   ```

2. **Check format (no quotes, no spaces around =):**
   ```bash
   ❌ EMAIL_USER = "john@gmail.com"
   ✅ EMAIL_USER=john@gmail.com
   ```

3. **Server logs for errors:**
   - Look at console output when starting `npm run dev`
   - Errors usually mention missing variable

4. **Verify variables loaded:**
   - Add to server.js: `console.log(process.env.PORT)`
   - Check output in console

5. **Reset to defaults:**
   ```bash
   cp .env.example .env
   # Edit with only essentials
   ```

---

## 🎓 Learn More

- [Node.js Environment Variables](https://nodejs.org/en/knowledge/file-system/how-to-use-the-dotenv-module/)
- [Twelve-Factor App - Config](https://12factor.net/config)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)

---

## ✅ Configuration Checklist

- [ ] `.env` file created
- [ ] `PORT` set
- [ ] `NODE_ENV` set to "development"
- [ ] `EMAIL_USER` and `EMAIL_PASS` configured (optional)
- [ ] `DATABASE_PATH` set
- [ ] `JWT_SECRET` changed from default
- [ ] `WALLET_ADDRESS` set (optional for crypto)
- [ ] All required variables filled (non-optional ones)
- [ ] `.env` is in `.gitignore`
- [ ] Server starts without errors: `npm run dev`

**Done! Your environment is configured.** 🎉
