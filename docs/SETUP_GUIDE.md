# Developer Setup Guide - API Hub

Quick start guide for developers to set up and run the project locally.

---

## 🎯 Prerequisites

Before you start, ensure you have:

- **Node.js** >= 20.0.0 ([Download](https://nodejs.org))
- **npm** >= 10.0.0 (comes with Node.js)
- **Git** ([Download](https://git-scm.com))
- **GitHub Account** (to clone repo)
- **Gmail Account** (for email testing)
- **Text Editor** (VS Code recommended)

### Check Installation

```bash
node --version    # Should show v20.0.0 or higher
npm --version     # Should show 10.0.0 or higher
git --version     # Should show 2.40.0 or higher
```

---

## 📦 Step 1: Clone Repository

```bash
# Clone the repo
git clone https://github.com/yourusername/api-hub-backend.git

# Navigate to project
cd api-hub-backend

# Check project structure
ls -la
```

---

## 🔧 Step 2: Install Dependencies

```bash
# Install all npm packages
npm install

# Verify installation
npm list   # Shows all installed packages
```

**Key Dependencies:**
- `express` - Web framework
- `sqlite3` - Database
- `nodemailer` - Email service
- `bcrypt` - Password hashing
- `cors` - Cross-origin requests
- `dotenv` - Environment variables
- `twilio` - SMS service
- `ethers` - Blockchain interaction

---

## 🔑 Step 3: Environment Setup

### Create `.env` file

```bash
# Copy example to .env
cp .env.example .env
```

### Configure `.env`

Edit `.env` and add your credentials:

```env
# Server
PORT=3000
NODE_ENV=development

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password

# Twilio (Optional)
TWILIO_ACCOUNT_SID=set-later
TWILIO_AUTH_TOKEN=set-later
TWILIO_PHONE_NUMBER=set-later

# Database
DATABASE_PATH=./app.db

# Blockchain
MONAD_RPC_URL=https://testnet-rpc.monad.xyz/
WALLET_ADDRESS=0x...your-wallet...
```

### How to Get Gmail App Password

**Video Guide:** [YouTube - Gmail App Password](https://support.google.com/accounts/answer/185833)

1. Go to [Google Account](https://myaccount.google.com)
2. Click "Security" in left menu
3. Enable "2-Step Verification" (if not enabled):
   - Click "2-Step Verification"
   - Click "Get started"
   - Enter your phone number
   - Verify code sent to phone
   - Save recovery codes in safe place
4. Find "App passwords" option (only appears after 2FA is enabled)
5. You'll see a dropdown - Select:
   - **App:** Mail
   - **Device:** Windows Computer (or your OS)
6. Click "Generate"
7. Google shows 16-character password: `xxxx xxxx xxxx xxxx`
8. Copy **without spaces**: `xxxxxxxxxxxxxxxx`
9. Paste into `.env`:
   ```
   EMAIL_USER=john.doe@gmail.com
   EMAIL_PASS=xxxxxxxxxxxxxxxx
   ```

⚠️ **IMPORTANT:** Use the **App Password** (16 chars), NOT your regular Gmail password!

**Test Email Service:**
```bash
node test_email_config.js
```

Expected output:
```
✓ Email service initialized
✓ Email credentials verified
✓ Ready to send OTP and notifications
```

### Troubleshooting Email

| Issue | Solution |
|-------|----------|
| "Invalid login" error | Use Gmail app password, not regular password |
| "Less secure apps blocked" | Install app password (2FA must be enabled) |
| "SMTP connection timeout" | Check internet connection, verify EMAIL_USER |
| OTP not received | Check spam folder, verify EMAIL_USER is correct |
| "535 5.7.8 Authentication failed" | Remove spaces from app password in .env |

---

---

## ⛅ Weather API Setup (Optional - for Real API Integration)

If you want to test real API integration (not just mock data):

### Get OpenWeatherMap API Key

1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Click "Sign Up" → Create free account
3. Confirm email
4. Go to [API Keys](https://home.openweathermap.org/api_keys)
5. Copy your "Default" API key (25-40 characters)
6. Add to `.env`:
   ```
   WEATHER_API_KEY=abc123def456ghi789jkl001mnop234qrs
   ```

### Test Weather API

```bash
# Start server
npm run dev

# In another terminal / browser, test:
curl "http://localhost:3000/api/weather?city=london"

# Expected response:
{
  "city": "London",
  "temperature": 15.5,
  "weather": "Partly cloudy",
  "humidity": 65
}
```

### Add More Real APIs

The project includes weather as example. To add more APIs:

1. Create new file: `routes/yourapi.js`
2. Add route handler with API key from `.env`
3. Import route in `server.js`
4. Test with cURL or Postman

---

## ⛓️ Blockchain Setup (Optional - for Crypto Payments)

If you want to test MetaMask wallet integration and crypto payments:

### Install MetaMask

1. Go to [MetaMask.io](https://metamask.io)
2. Click "Download" for your browser
3. Select your browser (Chrome, Firefox, Edge, etc.)
4. Click "Install"
5. Create new wallet:
   - Click "Create a new wallet"
   - Create password (strong!)
   - Save seed phrase in secure location (12 words)
   - Confirm seed phrase

**⚠️ CRITICAL:** Never share your seed phrase! Anyone with it can access your wallet!

### Add Monad Testnet Network

1. Open MetaMask (click extension icon)
2. Click network dropdown at top (shows "Ethereum Mainnet")
3. Click "Add network"
4. Fill in:
   - **Network name:** Monad Testnet
   - **RPC URL:** https://testnet-rpc.monad.xyz/
   - **Chain ID:** 10143
   - **Currency symbol:** MON
   - **Block explorer URL:** https://testnet-explorer.monad.xyz/
5. Click "Save"
6. Switch to "Monad Testnet" network

### Get Test Tokens

1. Go to [Monad Faucet](https://testnet-faucet.monad.xyz/) (if available)
2. OR ask Monad community for test tokens
3. You'll receive free test MON (not real money!)

### Configure Wallet Address

1. In MetaMask, open "Account 1"
2. Click address (0x...) to copy
3. Update `.env`:
   ```
   WALLET_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
   MONAD_RPC_URL=https://testnet-rpc.monad.xyz/
   ```

### Test Crypto Payment

1. Run server: `npm run dev`
2. Open http://localhost:3000
3. Go to an API detail page
4. Click "Pay with Crypto"
5. MetaMask should pop up
6. Click "Connect"
7. Approve transaction in MetaMask
8. Should show success or error

---

The database initializes automatically on first run, but you can manually create it:

```bash
# Run server once (creates app.db)
npm run dev

# Press Ctrl+C to stop

# Verify database was created
ls app.db
```

### Database Schema

```sql
-- Users Table
users: id, firstName, lastName, email, password, credits, apiKey, etc.

-- APIs Table
apis: id, name, provider, category, price, status

-- User-API Mapping
user_apis: id, user_id, api_id, api_key

-- Transactions
transactions: id, user_id, type, amount, date, tx_hash
```

---

## ▶️ Step 5: Run Development Server

### Start with Nodemon (Auto-reload)

```bash
npm run dev
```

**Output:**
```
╔════════════════════════════════════════╗
║        🚀 API HUB SERVER RUNNING        ║
╠════════════════════════════════════════╣
║  Environment: development              ║
║  Port: 3000                            ║
║  URL: http://localhost:3000            ║
╚════════════════════════════════════════╝
```

### Start Production Mode

```bash
npm start
```

---

## 🧪 Step 6: Test the API

### In Browser

Open http://localhost:3000 - You'll see the frontend

### Test API Endpoints with cURL

```bash
# 1. Send OTP
curl -X POST http://localhost:3000/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Response should show OTP in development mode
# Check console for the OTP code

# 2. Verify OTP
curl -X POST http://localhost:3000/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'

# 3. Register
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName":"John",
    "lastName":"Doe",
    "email":"john@example.com",
    "password":"Pass123!",
    "contact":"+919876543210",
    "otp":"123456"
  }'

# 4. Login
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"john@example.com",
    "password":"Pass123!"
  }'
```

### Use Postman

1. Download [Postman](https://www.postman.com/downloads/)
2. Create new request
3. Set method: POST
4. Set URL: `http://localhost:3000/send-otp`
5. Go to "Body" → Select "raw" → Select "JSON"
6. Enter: `{"email":"test@example.com"}`
7. Click "Send"

---

## 📁 Project Structure

```
api-hub-backend/
├── config/              # Configuration files
│   ├── database.js      # SQLite helpers
│   ├── email.js         # Nodemailer config
│   ├── blockchain.js    # Monad RPC config
│   └── twilio.js        # SMS config
│
├── routes/              # Route handlers
│   ├── auth.js          # Auth endpoints
│   └── apis.js          # API marketplace
│
├── utils/               # Utility functions
│   ├── otp.js           # OTP generation
│   ├── validators.js    # Input validation
│   └── emailTemplates.js# Email templates
│
├── server.js            # Main Express app
├── database.js          # Database initialization
├── index.html           # Frontend
├── style.css            # Styles
├── package.json         # Dependencies
├── .env.example         # Environment template
└── README.md            # Documentation
```

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module 'express'"

```bash
# Solution: Install dependencies
npm install
```

### Issue: "SMTP verification failed"

```
Problem: Email not configured correctly
Solution: 
1. Check EMAIL_USER and EMAIL_PASS in .env
2. Verify Gmail app password (not regular password)
3. Enable "Less secure app access" if needed
```

### Issue: "Database locked"

```
Problem: Multiple processes accessing database
Solution:
1. Stop all running instances (Ctrl+C)
2. Delete app.db if corrupted
3. Restart: npm run dev
```

### Issue: "Port 3000 already in use"

```bash
# Solution 1: Use different port
PORT=5000 npm run dev

# Solution 2: Kill process using port 3000
npx kill-port 3000
npm run dev
```

### Issue: "OTP not sending"

```
Check:
1. EMAIL_USER matches Gmail account
2. EMAIL_PASS is correct (16 chars)
3. Check .env file is loaded (restart server)
4. Check console for error messages
5. Try sending from Gmail directly
```

---

## 🔄 Workflow: Making Changes

### 1. Create Feature Branch

```bash
git checkout -b feature/add-payment-gateway
```

### 2. Make Changes

```bash
# Edit files in config/, routes/, utils/, or server.js
nano config/email.js
```

### 3. Test Changes

```bash
npm run dev
# Test endpoints with Postman/cURL
```

### 4. Commit Changes

```bash
git add .
git commit -m "Add payment gateway integration"
```

### 5. Push to GitHub

```bash
git push origin feature/add-payment-gateway
```

### 6. Create Pull Request

- Go to GitHub
- Create PR from your branch to `main`
- Add description
- Request review

---

## 📝 Coding Standards

### Follow These Conventions

```javascript
// ✅ Good
const MAX_ATTEMPTS = 3;
const verifyEmail = async (email) => { ... }
const { dbGet, dbRun } = require('../config/database');

// ❌ Bad
const max_attempts = 3;
function verifyEmail() { ... }
const db = require('../database');
```

### File Naming

```
✅ Good:
- email.js
- emailTemplates.js
- authController.js
- userRoutes.js

❌ Bad:
- Email.js
- email_templates.js
- auth_controller.js
- USER_ROUTES.js
```

---

## 🚀 Useful Commands

```bash
# Start dev server with auto-reload
npm run dev

# Start production server
npm start

# Run tests
npm test

# Check code quality
npm run lint

# Update dependencies
npm update

# List outdated packages
npm outdated

# Security audit
npm audit

# Fix security issues
npm audit fix

# Clean install (delete node_modules and reinstall)
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Learning Resources

### Understand the Stack

- [Express.js Guide](https://expressjs.com)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Nodemailer](https://nodemailer.com)
- [Blockchain Basics](https://ethereum.org/en/developers/)
- [REST API Best Practices](https://restfulapi.net)

### Project Documentation

- [README.md](./README.md) - Project overview
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API reference
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [REFACTORING_GUIDE.md](./REFACTORING_GUIDE.md) - Code structure

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch from `main`
3. Make logical, focused commits
4. Write clear commit messages
5. Push to your fork
6. Create Pull Request with description

### Commit Message Format

```
feat: Add payment gateway integration
fix: Resolve email sending timeout
docs: Update API documentation
refactor: Reorganize auth routes
test: Add unit tests for validators
```

---

## 🔐 Security Practices

- Never commit `.env` file
- Don't expose secrets in code
- Validate all user inputs
- Use parameterized queries
- Enable HTTPS in production
- Keep dependencies updated

---

## 📞 Getting Help

1. **Check existing issues** on GitHub
2. **Search documentation** (README.md, API_DOCUMENTATION.md)
3. **Create GitHub issue** with:
   - Problem description
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Error logs

4. **Contact developer** via email

---

## ✅ Pre-Deployment Checklist

Before pushing to production:

- [ ] All endpoints tested locally
- [ ] No hardcoded credentials
- [ ] `.env` variables configured
- [ ] Database initialized
- [ ] All optional services (Email, Weather, Crypto) tested
- [ ] No sensitive data in version control
- [ ] npm audit passes (no critical vulnerabilities)

---

## 📋 Quick Reference - Environment Variables

| Variable | Purpose | Required | Example |
|----------|---------|----------|---------|
| `PORT` | Server port | No | 3000 |
| `NODE_ENV` | Environment | No | development |
| `EMAIL_USER` | Gmail address | Yes* | user@gmail.com |
| `EMAIL_PASS` | Gmail app password | Yes* | xxxxxxxxxxxxxxxx |
| `WEATHER_API_KEY` | OpenWeatherMap key | No | abc123def... |
| `DATABASE_PATH` | SQLite file | No | ./app.db |
| `MONAD_RPC_URL` | Blockchain RPC | No | https://testnet-rpc.monad.xyz/ |
| `WALLET_ADDRESS` | Crypto wallet | No | 0x1234... |

*Required if using email/OTP features

---

## 🧪 Quick Test Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Test email service
node test_email_config.js

# Test all functionality
npm test

# Test weather API
curl "http://localhost:3000/api/weather?city=london"

# Check database
sqlite3 app.db ".tables"

# Kill port if stuck
npx kill-port 3000
```

---

## 📞 Troubleshooting Quick Links

- **Email not working?** → See [Email Troubleshooting](#troubleshooting-email)
- **Port already in use?** → See [Common Issues](#issue-port-3000-already-in-use)
- **Database errors?** → See [Common Issues](#issue-database-locked)
- **Module not found?** → See [Common Issues](#issue-cannot-find-module-express)

---

## 🎓 Learn More

- Express.js: [expressjs.com](https://expressjs.com/)
- SQLite: [sqlite.org](https://www.sqlite.org/)
- Nodemailer: [nodemailer.com](https://nodemailer.com/)
- MetaMask: [metamask.io](https://metamask.io/)
- REST APIs: [restfulapi.net](https://restfulapi.net/)

---

**Questions?** Check the other docs:
- 📖 [README.md](./README.md) - Project overview
- 🔗 [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - All API endpoints
- 🚀 [DEPLOYMENT.md](./DEPLOYMENT.md) - Deploy to production
- 🔧 [REFACTORING_GUIDE.md](./REFACTORING_GUIDE.md) - Code structure
- [ ] Error handling in place
- [ ] Logging working
- [ ] Security audit passed
- [ ] Performance tested
- [ ] Documentation updated
- [ ] Code reviewed

---

## 🎓 Next Steps

After setting up locally:

1. ✅ Explore the codebase
2. ✅ Run existing test files
3. ✅ Try all API endpoints
4. ✅ Understand database schema
5. ✅ Read API documentation
6. ✅ Make your first change
7. ✅ Deploy to development server

---

**Happy coding! 🚀 If you get stuck, check the documentation or create an issue.** 

