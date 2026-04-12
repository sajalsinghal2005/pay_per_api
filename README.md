# 🚀 API Hub - Marketplace Platform

> A modern API marketplace platform combining **real-time weather data**, **crypto payments**, **user authentication**, and an **interactive API catalog**. Built with Node.js, Express, SQLite, and React-style vanilla JavaScript.

![GitHub License](https://img.shields.io/badge/License-ISC-blue.svg)
![Node Version](https://img.shields.io/badge/Node-20%2B-green.svg)
![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen.svg)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [API Endpoints](#api-endpoints)
- [Screenshots](#screenshots)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## 🎯 Overview

**API Hub** is a comprehensive marketplace platform designed for developers to discover, integrate, and purchase third-party APIs. It features:

- 🔐 **Secure Authentication** - Email/password, MetaMask wallet integration
- 💰 **Multiple Payment Methods** - In-app credits + Cryptocurrency (Monad Testnet)
- 🌍 **Real API Integration** - OpenWeatherMap API for live weather data
- 📊 **Admin Dashboard** - Monitor revenue, API usage, and user activity
- 🎨 **Modern UI** - Dark glassmorphic design with responsive layouts
- 📱 **Mobile Optimized** - Works seamlessly on desktop, tablet, and mobile

---

## ✨ Features

### Core Features
- ✅ **User Authentication**
  - Email/password registration & login
  - MetaMask Web3 wallet authentication
  - Password recovery & OTP verification
  - Two-factor authentication support

- ✅ **API Marketplace**
  - Browse 11+ demo APIs (extensible)
  - Search & filter by category
  - Detailed API documentation
  - Real-time code examples
  - Copy-to-clipboard functionality

- ✅ **Payment Integration**
  - Credits-based purchasing
  - Cryptocurrency payments (Monad Testnet)
  - Transaction history & receipts
  - Wallet balance management

- ✅ **Developer Experience**
  - Interactive API details page
  - Live code examples (JavaScript)
  - API statistics & usage tracking
  - Endpoint documentation

- ✅ **Admin Features**
  - Revenue analytics dashboard
  - User management
  - API inventory control
  - Transaction monitoring
  - Financial reports

### Real API Integration
- 🌦️ **OpenWeatherMap** - Real weather data by city

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js 20+
- **Framework:** Express.js 4.19
- **Database:** SQLite3
- **Auth:** bcrypt, JWT
- **Email:** Nodemailer
- **HTTP Client:** Axios
- **Blockchain:** Ethers.js (Web3)

### Frontend
- **Language:** Vanilla JavaScript (no build step)
- **Styling:** Custom CSS3 with glassmorphism effects
- **Charts:** Chart.js
- **Icons:** Unicode + Emojis
- **Responsive:** Mobile-first design

### DevOps & Deployment
- **Version Control:** Git
- **Process Manager:** PM2 (optional)
- **Deployment:** Railway, Vercel, Heroku
- **Environment:** dotenv

---

## 📁 Project Structure

```
api-hub/
├── config/
│   ├── database.js          # SQLite setup & schema
│   ├── blockchain.js        # Web3 configuration
│   ├── email.js             # Nodemailer setup
│   └── ...
├── routes/
│   ├── auth.js              # Authentication endpoints
│   ├── apis.js              # API marketplace endpoints
│   ├── weather.js           # Real weather data endpoint
│   └── ...
├── middleware/
│   └── ...                  # Express middleware
├── controllers/
│   └── ...                  # Business logic (optional)
├── utils/
│   ├── emailTemplates.js    # Email templates
│   ├── validators.js        # Input validation
│   ├── otp.js               # OTP generation
│   └── ...
├── scripts/
│   └── ...                  # Utility scripts
├── docs/
│   ├── API_DOCUMENTATION.md
│   ├── SETUP_GUIDE.md
│   └── ...
├── index.html               # Main frontend
├── style.css                # Global styles
├── server.js                # Express app entry point
├── package.json
├── .env.example             # Environment template
├── .env                     # Local environment (git ignored)
└── app.db                   # SQLite database (auto-created)
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 20.0 or higher
- **npm** 10.0 or higher
- **Git** (for version control)

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd api-hub

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env with your configuration (see Environment Setup section below)

# 4. Start the development server
npm run dev
# or for production
npm start

# 5. Open in browser
# Navigate to http://localhost:3001
```

### Verify Installation
```bash
# In terminal, you should see:
# ✅ Connected to SQLite database
# ✅ [Email] SMTP connection verified
# ✅ Server running on port 3001
```

---

## 🔐 Environment Setup

### Create `.env` File

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### Required Environment Variables

#### 1. **Server Configuration**
```env
PORT=3001
NODE_ENV=development
```

#### 2. **Email Setup (Gmail)**
Required for OTP sending and password recovery.

**Steps:**
1. Go to [Google Account](https://myaccount.google.com)
2. Enable **2-Step Verification**
3. Navigate to **App Passwords** (https://myaccount.google.com/apppasswords)
4. Select "Mail" and "Windows Computer"
5. Copy the 16-character password

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
```

#### 3. **Database**
```env
DATABASE_PATH=./app.db
# Auto-creates SQLite database on first run
```

#### 4. **Blockchain Configuration (Monad Testnet)**
For cryptocurrency payments:

```env
MONAD_RPC_URL=https://testnet-rpc.monad.xyz/
WALLET_ADDRESS=0xYourEthereumWallet...
```

**Get test ETH:**
- Visit [Monad Testnet Faucet](#)
- Request test tokens for your wallet

#### 5. **Session & Security**
```env
SESSION_TIMEOUT=30
JWT_SECRET=your-super-secret-key-change-this-in-production
```

#### 6. **Real APIs (Optional)**
```env
WEATHER_API_KEY=your_openweathermap_api_key
# Get free key: https://openweathermap.org/api
```

### Format `.env` File Properly
```
# ✅ Correct format (no spaces around =)
PORT=3001
WEATHER_API_KEY=abc123def456

# ❌ Wrong format (spaces cause issues)
PORT = 3001
WEATHER_API_KEY = abc123def456
```

### Verify Environment Setup
```bash
# Check if variables are loaded
node -e "require('dotenv').config(); console.log(process.env.PORT)"
# Should output: 3001
```

---

## 🔌 API Endpoints

### Authentication Routes
```
POST   /auth/register              # User registration
POST   /auth/login                 # Email/password login
POST   /auth/login-metamask        # MetaMask Web3 login
POST   /auth/forgot-password       # Request password reset
POST   /auth/reset-password        # Reset with token
POST   /auth/login-confirm         # Confirm OTP
```

### API Marketplace Routes
```
GET    /api/apis                   # List all active APIs
GET    /api/admin/apis/all         # List all APIs (admin only)
POST   /api/apis/purchase          # Purchase with credits
POST   /api/apis/purchase-crypto   # Purchase with crypto
```

### Real Data Routes
```
GET    /weather?city=london        # Get real weather data
```

### Example Request
```bash
# Get weather for a city
curl "http://localhost:3001/weather?city=jaipur"

# Response:
{
  "city": "Jaipur",
  "temperature": 32.5,
  "weather": "Sunny"
}
```

---

## 📸 Screenshots

### Dashboard
- 📊 **User Analytics** - API usage, latency metrics
- 💰 **Billing Summary** - Credits, transactions, spending
- 📈 **Charts** - Weekly usage, error distribution

### API Marketplace
- 🔍 **Search & Filter** - By category, provider, price
- 📋 **API Cards** - Quick overview with badges
- ⭐ **Details Page** - Full documentation and examples

### Authentication
- 🔐 **Email/Password** - Secure registration
- 🦊 **MetaMask Integration** - Web3 wallet login
- 📱 **OTP Verification** - Two-factor authentication

---

## 📦 Deployment

### Option 1: Railway (Recommended)
```bash
# Already configured via railway.json
railway login
railway link
railway up
```

### Option 2: Vercel
```bash
# Configure vercel.json (already present)
vercel deploy
```

### Option 3: Heroku
```bash
heroku create your-app-name
git push heroku main
heroku config:set PORT=3001
```

### Environment Variables on Cloud
1. Go to your deployment dashboard
2. Add environment variables from `.env`
3. Make sure `NODE_ENV=production` is set
4. Restart application

---

## 🧪 Testing

### Manual Testing
```bash
# Start development server
npm run dev

# Test endpoints in another terminal
curl http://localhost:3001/weather?city=london

# Test authentication
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Automated Tests
```bash
# Run existing test files
node test_auth_login.js
node test_purchase_flow.js
node test_all.js
```

---

## 🎨 Code Style & Best Practices

### Project Architecture
```
MVC Pattern (partially implemented):
- Models: Database queries in config/database.js
- Views: HTML/CSS (index.html, style.css)
- Controllers: Route handlers in routes/
- Middleware: Express middleware in middleware/
```

### Configuration Management
- ✅ Environment variables in `.env`
- ✅ Sensitive data NOT committed to git
- ✅ `.env.example` as template for team members
- ✅ `.gitignore` includes `node_modules/`, `.env`, `*.db`

### Error Handling
- Global error handlers prevent crashes
- Graceful fallbacks for failed API calls
- User-friendly error messages

---

## 📝 Getting Started for Recruiters

### Clone & Run in 5 Minutes
```bash
git clone <repo>
cd api-hub
npm install
cp .env.example .env
# Edit .env with your Gmail credentials
npm start
```

### Key Files to Review
1. **`server.js`** - Express app setup (30 lines)
2. **`routes/auth.js`** - Authentication logic
3. **`routes/apis.js`** - Marketplace endpoints
4. **`index.html`** - Frontend single-page app
5. **`config/database.js`** - Schema & migrations

### Highlights for CV
- ✅ Full-stack JavaScript/Node.js
- ✅ RESTful API design
- ✅ Database design (SQLite)
- ✅ Authentication & authorization
- ✅ Payment integration (Crypto + Credits)
- ✅ Responsive UI design
- ✅ Environment configuration
- ✅ Error handling
- ✅ Modern development practices

---

## 🤝 Contributing

### Setup Development Environment
```bash
npm install
npm run dev
```

### Creating New Features
1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Make changes with meaningful commits
3. Push to branch: `git push origin feature/amazing-feature`
4. Open Pull Request

### Code Standards
- Use consistent naming conventions
- Add comments for complex logic
- Update `.env.example` if adding new variables
- Test changes before committing

---

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

---

## 📞 Support & Contact

- **Issues:** Create an issue on GitHub
- **Email:** [Your Email]
- **LinkedIn:** [Your LinkedIn Profile]

---

## 🎓 Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [SQLite Tutorial](https://www.sqlite.org/docs.html)
- [Web3.js Guide](https://docs.ethers.io/)
- [REST API Best Practices](https://restfulapi.net/)

---

**Made with ❤️ by [Your Name]**

Last Updated: April 2026
Version: 1.0.0
