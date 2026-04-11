# 🚀 API Hub - Marketplace & Credit System

A production-ready **API marketplace platform** that enables users to discover, purchase, and manage APIs with a robust credit system, blockchain verification, and multi-channel authentication.

<div align="center">

![Backend](https://img.shields.io/badge/Backend-Node.js%20|%20Express-green)
![Database](https://img.shields.io/badge/Database-SQLite-blue)
![Frontend](https://img.shields.io/badge/Frontend-HTML%20|%20CSS-yellow)
![Payment](https://img.shields.io/badge/Payment-Crypto%20|%20Email%20OTP-purple)

</div>

---

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation & Setup](#installation--setup)
- [API Integrations](#api-integrations)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Usage Examples](#usage-examples)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## ✨ Features

### 🔐 Authentication & Security
- **Multi-factor OTP Authentication** - Secure email-based OTP (6-digit codes)
- **User Registration & Login** - Password hashing with bcrypt
- **Password Reset** - Secure password recovery via email
- **JWT Sessions** - Persistent user sessions
- **Two-Factor Authentication** - Optional 2FA for enhanced security

### 💳 Credits & Billing System
- **Dynamic Credit Management** - Purchase and use credits per API call
- **Auto-Recharge** - Automatic recharge when credits fall below threshold
- **Low Credit Notifications** - Email alerts when credits are running low
- **Usage Analytics** - Track API usage and credit consumption
- **Billing Dashboard** - View transaction history and invoices

### 💰 Purchase & Payment Options
- **Fiat Payment** - Email-based OTP verification for secure payments
- **Cryptocurrency Payment** - Direct blockchain transaction verification
  - Monad Testnet integration
  - Automated transaction validation
  - Zero-fee settlements
- **Subscription Tiers** - Free, Pro, Enterprise plans

### 🔗 API Management
- **API Marketplace** - Browse and discover 100+ integrated APIs
- **API Categories** - Organize by Weather, Communication, Payment, etc.
- **Purchase APIs** - Add APIs to your subscription instantly
- **Usage Tracking** - Real-time API call monitoring
- **API Key Management** - Auto-generated secure API keys

### 📱 Multi-Channel Notifications
- **Email Notifications** - Order confirmations, alerts, notifications
- **SMS Notifications** - Via Twilio for critical alerts
- **Real-time Updates** - Instant notification system

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend Framework** | Express.js (Node.js) |
| **Database** | SQLite3 |
| **Authentication** | bcrypt + Email OTP |
| **Email Service** | Nodemailer + Gmail SMTP |
| **SMS Service** | Twilio |
| **Blockchain** | Ethers.js + Monad Testnet |
| **Frontend** | Vanilla HTML, CSS, JavaScript |
| **DevOps** | Docker, Railway, Vercel |

---

## 📦 Installation & Setup

### Prerequisites
- **Node.js** >= 20.0.0
- **npm** or **yarn**
- **Git**
- Gmail account (for email notifications)
- Twilio account (for SMS notifications)
- Monad Testnet account (for crypto payments - optional)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/api-hub-backend.git
   cd api-hub-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   Configure your `.env` file (see [Environment Variables](#environment-variables))

4. **Start the development server**
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:3000`

5. **Access the application**
   Open `http://localhost:3000` in your browser

---

## 🔌 API Integrations

### Email Service (Nodemailer + Gmail)
- **Purpose**: OTP delivery, order confirmations, alerts
- **Config**: Gmail account with App Password
- **Features**: 
  - Custom email templates
  - Queue-based delivery
  - Retry mechanism for failed sends

### SMS Service (Twilio)
- **Purpose**: Critical alerts and notifications
- **Config**: Twilio Account SID and Auth Token
- **Features**:
  - Low-credit warnings
  - Payment confirmations
  - Support alerts

### Blockchain (Monad Testnet RPC)
- **Purpose**: Verify crypto transactions directly on-chain
- **Network**: Monad Testnet
- **Features**:
  - Direct RPC calls for tx verification
  - Automatic recipient and amount validation
  - Gas-free settlements

### Payment Providers
- **Email OTP Method**: Built-in, no external dependency
- **Crypto Method**: Direct blockchain verification
- **Future**: Stripe, PayPal integration ready

---

## 📁 Project Structure

```
api-hub-backend/
├── config/                  # Configuration files
│   ├── database.js         # SQLite setup and schemas
│   ├── email.js            # Nodemailer config
│   ├── twilio.js           # Twilio config
│   └── blockchain.js       # Monad RPC config
│
├── routes/                 # API route handlers
│   ├── auth.js            # Authentication endpoints
│   ├── apis.js            # API marketplace endpoints
│   ├── user.js            # User dashboard endpoints
│   ├── payment.js         # Payment & credit endpoints
│   └── admin.js           # Admin endpoints
│
├── controllers/            # Business logic
│   ├── authController.js   # Auth logic
│   ├── apiController.js    # API logic
│   ├── userController.js   # User logic
│   └── paymentController.js # Payment logic
│
├── middleware/             # Express middleware
│   ├── auth.js            # Authentication middleware
│   ├── errorHandler.js    # Error handling
│   └── validation.js      # Request validation
│
├── utils/                 # Utility functions
│   ├── otp.js            # OTP generation & validation
│   ├── blockchain.js     # Blockchain helpers
│   └── validators.js     # Input validators
│
├── server.js             # Main Express app
├── index.html            # Frontend (UI)
├── style.css            # Frontend styles
├── package.json         # Dependencies
├── .env.example         # Example environment file
└── README.md           # Documentation
```

---

## 🔑 Environment Variables

Create a `.env` file in the root directory (copy from `.env.example`):

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Database
DATABASE_PATH=./app.db

# Blockchain (Monad Testnet)
MONAD_RPC_URL=https://testnet-rpc.monad.xyz/
WALLET_ADDRESS=0x...your-wallet-address...

# Session Configuration
SESSION_TIMEOUT=30
JWT_SECRET=your-secret-key-change-this-in-production

# Feature Flags
ENABLE_2FA=true
ENABLE_AUTO_RECHARGE=true
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_SMS_NOTIFICATIONS=true
```

### How to get Credentials:

**Gmail App Password:**
1. Enable 2-Step Verification on Google Account
2. Create App Password: https://myaccount.google.com/apppasswords
3. Copy 16-character password to `EMAIL_PASS`

**Twilio:**
1. Sign up at https://www.twilio.com
2. Get Account SID and Auth Token from Dashboard
3. Verify phone number for SMS

**Monad Testnet RPC:**
- Already configured: `https://testnet-rpc.monad.xyz/`
- Change `WALLET_ADDRESS` to your address

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/send-otp` | Send OTP to email |
| POST | `/verify-otp` | Verify OTP code |
| POST | `/register` | Create new account |
| POST | `/login` | Login with credentials |
| POST | `/forgot-password` | Initiate password reset |
| POST | `/reset-password` | Reset password |

### API Marketplace
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/apis` | List all available APIs |
| GET | `/api/admin/apis/all` | Admin: View all APIs (admin only) |
| POST | `/api/apis/purchase` | Purchase API with credits |
| POST | `/api/apis/purchase-crypto` | Purchase API with crypto |
| POST | `/api/user/:userId/apis/:apiId/remove` | Remove purchased API |

### User Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/:id/dashboard` | User dashboard overview |
| GET | `/api/user/:id/billing` | Billing history |
| GET | `/api/user/:id/usage` | API usage analytics |
| GET | `/api/user/:id/subscription` | Subscription details |

---

## 💡 Usage Examples

### 1. Register & Login
```javascript
// Register
const response = await fetch('/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'SecurePass123!',
    contact: '+919876543210'
  })
});
const user = await response.json();
```

### 2. Send OTP
```javascript
const response = await fetch('/send-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'john@example.com' })
});
// User will receive 6-digit OTP via email
```

### 3. Purchase API with Credits
```javascript
const response = await fetch('/api/apis/purchase', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: user.id,
    apiId: 1,
    creditsPerCall: 50
  })
});
const confirmation = await response.json();
// Confirmation: { success: true, message: "API purchase successful" }
```

### 4. Purchase API with Crypto
```javascript
const response = await fetch('/api/apis/purchase-crypto', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: user.id,
    apiId: 2,
    txHash: '0xabcd...1234'  // Blockchain tx hash
  })
});
// Transaction verified on-chain
```

---

## 🚀 Deployment

### Deploy to Railway
1. Connect your GitHub repository
2. Railway auto-detects `Procfile`:
   ```
   web: node server.js
   ```
3. Set environment variables in Railway dashboard
4. Deploy! 🎉

### Deploy to Vercel (Serverless)
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel` and follow prompts
3. API functions served via Vercel Functions

### Deploy to Heroku
```bash
git push heroku main
heroku config:set EMAIL_USER=...
heroku config:set EMAIL_PASS=...
```

### Docker Deployment
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t api-hub .
docker run -p 3000:3000 --env-file .env api-hub
```

---

## 🧪 Testing

Run test files to verify functionality:
```bash
# Test authentication flow
node test_auth_login.js

# Test API purchase flow
node test_purchase_flow.js

# Test all features
node test_all.js
```

---

## 📊 Database Schema

### Users Table
```sql
- id (PK)
- firstName, lastName, email (UNIQUE)
- password (hashed with bcrypt)
- contact, role, organization
- credits (default: 500)
- apiKey (auto-generated)
- subscription_tier (Free/Pro/Enterprise)
- status, autoRecharge, lowCreditNotifications
- sessionTimeout, twoFactorAuth
```

### APIs Table
```sql
- id (PK)
- name, description, category
- pricing, creditsPerCall
- baseUrl, apiKey (for integration)
```

### Transactions Table
```sql
- id (PK)
- userId, apiId, amount (in credits)
- type (purchase/refund/debit)
- timestamp, status
```

---

## 🔒 Security Best Practices

✅ **Implemented:**
- Password hashing with bcrypt
- Email OTP for account verification
- Session-based authentication
- CORS protection
- Input validation
- Error handling (no sensitive info leaked)

⚠️ **Recommended:**
- Add rate limiting for OTP generation
- Implement request validation schema
- Use HTTPS in production (SSL/TLS)
- Store sensitive keys in secret manager (AWS Secrets Manager, HashiCorp Vault)
- Regular security audits
- Add WAF (Web Application Firewall)

---

## 🐛 Troubleshooting

### Email not sending?
- Check Gmail App Password is correct
- Enable "Less secure app access"
- Verify SMTP connection: `transporter.verify()`

### Blockchain verification fails?
- Confirm Monad Testnet RPC is reachable
- Check wallet address format (0x prefix)
- Verify transaction amount >= 0.001 ETH

### Database locked?
- Close other db connections
- Restart server: `npm run dev`
- Check SQLite process: `lsof -i :3000`

---

## 📈 Future Roadmap

- [ ] Payment gateway integration (Stripe, PayPal)
- [ ] Advanced analytics dashboard
- [ ] GraphQL API
- [ ] Rate limiting per API
- [ ] Webhook support for API integrations
- [ ] Mobile app (React Native)
- [ ] WebSocket for real-time updates
- [ ] Machine learning for usage predictions

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📄 License

This project is licensed under the ISC License - see [LICENSE](LICENSE) file for details.

---

## 💬 Support & Feedback

- **Issues**: Report bugs on GitHub Issues
- **Questions**: Start a Discussion
- **Contact**: subodh@example.com

---

<div align="center">

**Made with ❤️ for the Developer Community**

⭐ Star this repo if you found it useful!

</div>
