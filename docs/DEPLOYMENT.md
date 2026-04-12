# 🚀 Deployment Guide - API Hub

Complete guide to deploy API Hub to various platforms.

## 📋 Pre-Deployment Checklist

- [ ] All dependencies in `package.json`
- [ ] Environment variables configured (`.env` file)
- [ ] Database initialized (`app.db` created)
- [ ] Tests passing
- [ ] No hardcoded credentials in code
- [ ] HTTPS enabled (for production)
- [ ] Error logging configured
- [ ] Environment is set to `NODE_ENV=production`

---

## 🚂 Deploy to Railway

**Best for:** Quick Node.js deployment with PostgreSQL/SQLite integration

### Prerequisites
- Railway account: https://railway.app
- GitHub repository pushed

### Steps

1. **Connect GitHub Repository**
   - Login to Railway
   - Click "New Project"
   - Select "Deploy from GitHub"
   - Authorize and select your repository

2. **Configure Environment Variables**
   ```bash
   PORT=3000
   NODE_ENV=production
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   TWILIO_ACCOUNT_SID=...
   TWILIO_AUTH_TOKEN=...
   TWILIO_PHONE_NUMBER=...
   WALLET_ADDRESS=0x...
   ```

3. **Railway Auto-Detects**
   - Reads `Procfile` or `package.json` start script
   - Creates Node.js environment
   - Installs dependencies

4. **Deploy**
   ```bash
   git push origin main
   # Railway auto-deploys on push
   ```

5. **Get Your URL**
   - Railway provides: `https://api-hub-production.up.railway.app`
   - Share this with users

### Benefits
- ✅ Automatic deployments on git push
- ✅ Built-in PostgreSQL support
- ✅ Environment variable management
- ✅ Easy rollback
- ✅ Free tier available
- ✅ Custom domain support

---

## 📦 Deploy to Vercel (Serverless)

**Best for:** Serverless/Serverless function architecture

### Prerequisites
- Vercel account: https://vercel.com
- GitHub account connected

### Steps

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Configure Vercel Settings**
   
   Create `vercel.json` in root:
   ```json
   {
     "version": 2,
     "buildCommand": "npm install",
     "env": {
       "NODE_ENV": "production"
     },
     "public": true,
     "rewrites": [
       { "source": "/(.*)", "destination": "/api/$1" }
     ]
   }
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add EMAIL_USER
   vercel env add EMAIL_PASS
   # ... add all environment variables
   vercel --prod
   ```

### Notes
- SQLite works on Vercel (file-based)
- Session data may not persist (use external DB for production)
- Best for APIs, not long-running processes

---

## 🐳 Deploy with Docker

**Best for:** Container-based deployment (AWS, Azure, GCP)

### Prerequisites
- Docker installed
- Docker Hub account (optional, for push)

### Steps

1. **Create Dockerfile**
   ```dockerfile
   # Already in repo as Dockerfile example
   FROM node:20-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build Docker Image**
   ```bash
   docker build -t api-hub:latest .
   ```

3. **Test Locally**
   ```bash
   docker run -p 3000:3000 \
     --env-file .env \
     api-hub:latest
   ```

4. **Push to Docker Hub**
   ```bash
   # Login to Docker Hub
   docker login
   
   # Tag image
   docker tag api-hub:latest yourusername/api-hub:latest
   
   # Push
   docker push yourusername/api-hub:latest
   ```

### Deploy to AWS ECS/Heroku/Azure
Follow platform-specific container deployment docs

---

## 🌐 Deploy to Heroku

**Best for:** Traditional Platform-as-a-Service

### Prerequisites
- Heroku account
- Heroku CLI installed

### Steps

1. **Login to Heroku**
   ```bash
   heroku login
   ```

2. **Create Heroku App**
   ```bash
   heroku create api-hub-production
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set EMAIL_USER=your-email@gmail.com
   heroku config:set EMAIL_PASS=your-app-password
   heroku config:set NODE_ENV=production
   # ... set all variables
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

5. **View Logs**
   ```bash
   heroku logs --tail
   ```

6. **Access App**
   ```bash
   heroku open
   # Opens https://api-hub-production.herokuapp.com
   ```

### Benefits
- ✅ Easy Git integration
- ✅ Automatic SSL certificates
- ✅ Easy to scale
- ✅ Good documentation
- ⚠️ Pricing can be high

---

## ☁️ Deploy to AWS

### Option A: AWS Elastic Beanstalk (Easiest)

1. **Install AWS CLI**
   ```bash
   pip install awscli
   ```

2. **Initialize Elastic Beanstalk**
   ```bash
   eb init
   eb create api-hub-env
   eb setenv \
     EMAIL_USER=... \
     EMAIL_PASS=... \
     NODE_ENV=production
   eb deploy
   ```

### Option B: AWS Lambda (Serverless)

Convert Express to AWS Lambda:
- Use `serverless-express` package
- Deploy via AWS SAM or Serverless Framework

---

## 🏃 Deploy to PaaS (Platform Agnostic)

### Procfile (for Heroku-compatible platforms)

Already in repo:
```
web: node server.js
```

Works on:
- ✅ Heroku
- ✅ Railway
- ✅ Fly.io
- ✅ Render

---

## 🔒 Production Security Checklist

1. **Enable HTTPS**
   ```bash
   # Automatic on most platforms
   # Heroku, Railway provide free SSL
   ```

2. **Set NODE_ENV=production**
   ```bash
   export NODE_ENV=production
   ```

3. **Use Strong Secrets**
   ```bash
   # Generate random JWT secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   
   # Set in production .env
   JWT_SECRET=<generated-secret>
   ```

4. **Enable CORS Properly**
   ```javascript
   // In production, restrict CORS
   app.use(cors({
     origin: 'https://yourdomain.com',
     credentials: true
   }));
   ```

5. **Rate Limiting** (not yet implemented)
   ```bash
   npm install express-rate-limit
   ```

6. **Use Environment Variables**
   - ✅ EMAIL credentials
   - ✅ Database URL
   - ✅ API keys
   - ✅ JWT secret
   - ✅ CORS origins

7. **Monitor Logs**
   - Check production logs regularly
   - Set up log aggregation (e.g., LogRocket, Sentry)

---

## 📊 Performance Optimization

1. **Enable Gzip Compression**
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

2. **Set Cache Headers**
   ```javascript
   app.use(express.static(__dirname, {
     maxAge: '1d',
     etag: false
   }));
   ```

3. **Implement Caching**
   - Cache API responses (Redis preferred)
   - In-memory for small datasets

4. **Database Indexing**
   - Add indexes on `users.email`
   - Add indexes on `transactions.user_id`

5. **Lazy Load Dependencies**
   - Only import modules when needed

---

## 🚨 Monitoring & Logging

### Setup Error Tracking (Sentry)

```bash
npm install @sentry/node
```

```javascript
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0
});

app.use(Sentry.Handlers.errorHandler());
```

### Setup Performance Monitoring
- Use APM tools (New Relic, DataDog, Prometheus)
- Track response times
- Monitor database queries

---

## 📈 Scaling Strategy

### As Traffic Grows

1. **Stage 1: Single Server (Current)**
   - Single node instance
   - SQLite database
   - In-memory sessions
   - Cost: ~$0-15/month

2. **Stage 2: Databases Separated**
   - Migrate to PostgreSQL
   - Use Railway/AWS RDS
   - Cost: ~$15-50/month

3. **Stage 3: Horizontal Scaling**
   - Multiple app instances
   - Load balancing (Railway/AWS does this)
   - Distributed sessions (Redis)
   - Cost: ~$50-200/month

4. **Stage 4: Microservices**
   - Separate auth, payment, notification services
   - Message queues (RabbitMQ, SQS)
   - API Gateway
   - Cost: ~$200+/month

---

## 🔄 Continuous Deployment (CI/CD)

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - uses: actions/setup-node@v2
        with:
          node-version: '20'
      
      - run: npm ci
      - run: npm test
      
      - name: Deploy to Railway
        run: |
          npm i -g @railway/cli
          railway up --service api-hub
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## 📱 API Endpoints for Frontend

Once deployed on Railway:

```javascript
const API_URL = 'https://api-hub-production.up.railway.app';

// Auth
POST ${API_URL}/send-otp
POST ${API_URL}/verify-otp
POST ${API_URL}/register
POST ${API_URL}/login

// APIs
GET ${API_URL}/api/apis
POST ${API_URL}/api/apis/purchase
POST ${API_URL}/api/apis/purchase-crypto

// User
GET ${API_URL}/api/user/:id/dashboard
GET ${API_URL}/api/user/:id/billing
GET ${API_URL}/api/user/:id/usage
```

Update `index.html` or frontend config:

```javascript
// frontend/config.js
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
```

---

## ✅ Post-Deployment

1. **Test all endpoints** with production data
2. **Monitor logs** for first 24 hours
3. **Backup database** regularly
4. **Setup uptime monitoring** (UptimeRobot, Pingdom)
5. **Verify email/SMS** sending works
6. **Test blockchain** verification
7. **Load test** the API
8. **Security audit** the deployment

---

## 🆘 Troubleshooting Common Issues

### "Cannot find module" error
```bash
npm ci  # Clean install
npm start
```

### Database locked
```bash
# Restart server, close all connections
npm run dev
```

### Email not sending
- Check Gmail app password (generate new one)
- Verify SMTP settings in logs
- Check spam folder

### Blockchain verification fails
- Confirm wallet address format (0x prefix)
- Verify Monad RPC is reachable
- Check transaction hash on testnet explorer

### Cold start on serverless
- Use railway/render for faster cold starts
- Keep functions warm with scheduled pings

---

## 📞 Support & Maintenance

- **Regular Updates**: Run `npm update` monthly
- **Security Patches**: Apply immediately (`npm audit fix`)
- **Backups**: Daily database backups
- **Monitoring**: Set alerts for errors, downtime
- **Documentation**: Keep deployment docs updated

---

**Ready to deploy! 🎉 Choose Railway for fastest setup.** ⚡
