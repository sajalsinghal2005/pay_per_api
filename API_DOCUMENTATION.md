# API Documentation - API Hub

Complete API reference with examples, request/response formats, and use cases.

---

## 🔐 Authentication Endpoints

### 1. Send OTP

**Endpoint:** `POST /send-otp`

**Purpose:** Send 6-digit OTP to user email for verification

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP sent successfully to your email",
  "otp": "123456"  // Only in development mode
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Valid email is required"
}
```

**Status Codes:**
- `200` - OTP sent successfully
- `400` - Invalid email format
- `500` - Email service error

**Use Cases:**
- User registration verification
- Login confirmation
- Password reset initiation
- Critical action verification (payment, API purchase)

---

### 2. Verify OTP

**Endpoint:** `POST /verify-otp`

**Purpose:** Verify that user has correct OTP code

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP verified successfully"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "OTP expired or not valid"
}
```

**Note:** OTP expires after 5 minutes. User must re-request if expired.

---

### 3. Register

**Endpoint:** `POST /register`

**Purpose:** Create new user account

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "contact": "+919876543210",
  "password": "SecurePass123!",
  "otp": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Registration successful. Please login."
}
```

**Response (Error - Email exists):**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

**Response (Error - OTP invalid):**
```json
{
  "success": false,
  "message": "OTP verification failed"
}
```

**Validation Rules:**
- ✅ First Name: 1-100 characters
- ✅ Last Name: 1-100 characters
- ✅ Email: Valid email format, unique
- ✅ Password: Minimum 6 characters
- ✅ OTP: Must be valid and not expired
- ✅ Contact: Optional, 10+ digits

**Post-Registration:**
- User gets 500 free credits
- Auto-generated API key
- Status: "active"
- Subscription: "Free"

---

### 4. Login

**Endpoint:** `POST /login`

**Purpose:** Authenticate user with email & password

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "userId": 1,
  "email": "john@example.com"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Response (Suspended Account):**
```json
{
  "success": false,
  "message": "Account suspended. Contact support."
}
```

---

### 5. Forgot Password

**Endpoint:** `POST /forgot-password`

**Purpose:** Initiate password reset process

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If account exists, you will receive recovery email",
  "userId": 1
}
```

**Security Note:** Frontend doesn't reveal if email exists (prevents user enumeration)

---

### 6. Reset Password

**Endpoint:** `POST /reset-password`

**Purpose:** Update password after OTP verification

**Request:**
```json
{
  "userId": 1,
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePass456!"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Invalid or expired OTP"
}
```

---

## 🏪 API Marketplace Endpoints

### 7. List All APIs

**Endpoint:** `GET /api/apis`

**Purpose:** Get all available APIs in marketplace

**Query Parameters:** None

**Response:**
```json
[
  {
    "id": 1,
    "name": "Weather API",
    "provider": "OpenWeather",
    "description": "Real-time weather data",
    "category": "Weather",
    "price": 100,
    "rating": 4.5,
    "image": "https://...",
    "status": "active"
  },
  {
    "id": 2,
    "name": "SMS API",
    "provider": "Twilio",
    "description": "Send SMS messages",
    "category": "Communication",
    "price": 150,
    "rating": 4.8,
    "image": "https://...",
    "status": "active"
  }
]
```

**Use Cases:**
- Display marketplace in UI
- Search/filter APIs
- Show API details and pricing

---

### 8. Purchase API (with Credits)

**Endpoint:** `POST /api/apis/purchase`

**Purpose:** Purchase API using account credits

**Request:**
```json
{
  "userId": 1,
  "apiId": 2
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "API purchased successfully",
  "api_key": "ak_svc_abc123def456",
  "creditsRemaining": 850
}
```

**Response (Error - Insufficient Credits):**
```json
{
  "success": false,
  "message": "Insufficient credits. Need 150, have 100"
}
```

**Response (Error - Already Purchased):**
```json
{
  "success": false,
  "message": "This API is already in your collection"
}
```

**Status Codes:**
- `200` - Purchase successful
- `400` - Invalid request
- `402` - Insufficient credits
- `404` - API or user not found
- `409` - Already purchased

**What Happens:**
1. ✅ API key generated (ak_svc_...)
2. ✅ User_apis record created
3. ✅ Credits deducted from account
4. ✅ Transaction logged
5. ✅ Email confirmation sent

---

### 9. Purchase API (with Crypto)

**Endpoint:** `POST /api/apis/purchase-crypto`

**Purpose:** Purchase API using blockchain transaction

**Request:**
```json
{
  "userId": 1,
  "apiId": 2,
  "txHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "API purchased via cryptocurrency!",
  "api_key": "ak_svc_xyz789uvw456",
  "discount": "20%",
  "amountPaid": 120,
  "totalValue": 150
}
```

**Benefits of Crypto Purchase:**
- 🚀 Instant settlement (no payment processor)
- 💰 20% discount (crypto incentive)
- 🔗 Decentralized & transparent
- ⛓️ Blockchain verified

**Verification Process:**
1. Get transaction from blockchain
2. Verify recipient address
3. Verify minimum amount (0.001+ ETH)
4. Check transaction receipt
5. Confirm success status

---

## 👤 User Dashboard Endpoints

### 10. Dashboard Overview

**Endpoint:** `GET /api/user/:id/dashboard`

**Purpose:** Get user dashboard summary

**Path Parameters:**
- `id` (number): User ID

**Response:**
```json
{
  "credits": 850,
  "apiKey": "ak_live_user123456",
  "activeApis": [
    {
      "apiId": 1,
      "name": "Weather API",
      "category": "Weather",
      "badge": "⭐ Premium",
      "userApiId": 5,
      "api_key": "ak_svc_abc123"
    },
    {
      "apiId": 2,
      "name": "SMS API",
      "category": "Communication",
      "badge": "✅ Active",
      "userApiId": 6,
      "api_key": "ak_svc_def456"
    }
  ]
}
```

---

### 11. Billing History

**Endpoint:** `GET /api/user/:id/billing`

**Purpose:** Get all transactions (purchases, topups, refunds)

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "type": "purchase",
    "amount": 100,
    "description": "Weather API Purchase",
    "date": "2026-04-10T15:30:00Z",
    "tx_hash": null,
    "status": "completed"
  },
  {
    "id": 2,
    "user_id": 1,
    "type": "topup",
    "amount": 1000,
    "description": "Manual Wallet Top-up",
    "date": "2026-04-09T10:00:00Z",
    "tx_hash": "0xabc123...",
    "status": "confirmed"
  }
]
```

**Transaction Types:**
- `purchase` - API purchase
- `topup` - Manual credit purchase
- `refund` - Refund/credit
- `subscription` - Subscription upgrade

---

### 12. Usage Analytics

**Endpoint:** `GET /api/user/:id/usage`

**Purpose:** Get API usage statistics and metrics

**Response:**
```json
{
  "success": true,
  "datasets": [
    {
      "label": "Weather API",
      "data": [1200, 1450, 980, 2100, 1800, 2300, 1900],
      "backgroundColor": "#1f4ed8",
      "borderRadius": 4
    },
    {
      "label": "SMS API",
      "data": [500, 620, 450, 800, 750, 920, 680],
      "backgroundColor": "#10b981",
      "borderRadius": 4
    }
  ],
  "totalRequests": "14350",
  "avgLatency": "185 ms",
  "errorRate": "0.8%"
}
```

**Metrics:**
- 📊 Daily request counts (last 7 days)
- ⏱️ Average latency
- ❌ Error rate percentage
- 📈 Total requests

---

### 13. Subscription Details

**Endpoint:** `GET /api/user/:id/subscription`

**Purpose:** Get current subscription tier and payment method

**Response:**
```json
{
  "success": true,
  "subscription_tier": "Free",
  "paymentMethod": "Visa ending in 4242"
}
```

**Subscription Tiers:**
- **Free** - 500 starting credits, limited APIs
- **Pro Developer** - 10,000 credits, more APIs
- **Enterprise** - Unlimited, custom integrations

---

## 💳 Payment Endpoints (Future)

### Topup with Credit Card
```
POST /api/user/:id/topup
{
  "amount": 1000,
  "paymentMethod": "card"
}
```

### Topup with Crypto
```
POST /api/user/:id/topup-crypto
{
  "amount": 500,
  "txHash": "0x..."
}
```

### Upgrade Subscription
```
POST /api/user/:id/subscription/upgrade
{
  "tier": "Pro Developer"
}
```

---

## 📊 Request/Response Format

### Common Headers

**Request:**
```
Content-Type: application/json
Authorization: Bearer <token> (future)
```

**Response:**
```
Content-Type: application/json
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1680000000
```

---

## ❌ Error Responses

### Standard Error Format

```json
{
  "success": false,
  "message": "Human-readable error message",
  "errorCode": "INSUFFICIENT_CREDITS",
  "details": {
    "required": 150,
    "available": 100
  }
}
```

### Common HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| `200` | Success | API purchased |
| `400` | Bad request | Missing email |
| `401` | Unauthorized | Invalid password |
| `402` | Payment required | Low credits |
| `403` | Forbidden | Account suspended |
| `404` | Not found | API doesn't exist |
| `409` | Conflict | Already purchased |
| `429` | Too many requests | Rate limited |
| `500` | Server error | Database error |

---

## 🔄 API Integration Examples

### Using JavaScript (Fetch)

```javascript
// Register
const register = async () => {
  const response = await fetch('/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'user@example.com' })
  });
  const data = await response.json();
  console.log(data);
};

// Purchase API
const purchaseAPI = async (userId, apiId) => {
  const response = await fetch('/api/apis/purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, apiId })
  });
  const { api_key } = await response.json();
  return api_key;
};
```

### Using Python (Requests)

```python
import requests

BASE_URL = "http://localhost:3000"

# Send OTP
resp = requests.post(f"{BASE_URL}/send-otp", json={
    "email": "user@example.com"
})
print(resp.json())

# Register
resp = requests.post(f"{BASE_URL}/register", json={
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "Pass123!",
    "otp": "123456"
})
print(resp.json())
```

### Using cURL

```bash
# Send OTP
curl -X POST http://localhost:3000/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'

# Purchase API
curl -X POST http://localhost:3000/api/apis/purchase \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "apiId": 2}'
```

---

## 🧪 Testing API Endpoints

### Using Postman

1. Import collection: [api-hub.postman_collection.json]
2. Set environment variables:
   - `BASE_URL`: http://localhost:3000
   - `USER_ID`: 1
   - `API_ID`: 2
3. Run requests in order (auth first)

### Using Swagger/OpenAPI (Future)

Add API documentation at `/api/docs`

---

## 📈 Rate Limiting (Future)

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1680000000
```

Current limits: None (implement for production)

---

## 🔐 Security Best Practices

1. **Always use HTTPS** in production
2. **Never expose API keys** in frontend code
3. **Validate all inputs** on server side
4. **Use rate limiting** to prevent abuse
5. **Store credentials** in .env file
6. **Implement CORS** properly

---

## 📞 Support

- **Issues:** Create GitHub issue
- **Questions:** Email support@apihub.com
- **Bugs:** Report with reproduction steps

---

**API Hub | Version 1.0.0 | Last Updated: 2026-04-10**
