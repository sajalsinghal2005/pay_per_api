# Pay Per API Full Stack Upgrade

## New folder structure

- `backend/`
  - `package.json`
  - `server.js`
  - `.env.example`
  - `config/db.js`
  - `middleware/auth.js`
  - `middleware/apiKeyAuth.js`
  - `models/User.js`
  - `models/Usage.js`
  - `routes/auth.js`
  - `routes/dashboard.js`
  - `routes/api.js`
  - `utils/generateApiKey.js`
  - `utils/validators.js`

- `frontend/`
  - `index.html`
  - `login.html`
  - `signup.html`
  - `dashboard.html`
  - `styles.css`
  - `app.js`

## Backend setup

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Create `.env` from `.env.example`.
3. Set `MONGODB_URI`, `JWT_SECRET`, and `JWT_EXPIRES_IN`.
4. Start backend locally:
   ```bash
   npm run dev
   ```

## Frontend setup

1. Serve the `frontend/` folder as static files.
2. Open `frontend/login.html` or `frontend/signup.html` in a browser.
3. Update `API_BASE_URL` in `frontend/app.js` to your backend URL after deploy.

## Deployment

### Backend (Render)

- Create a new Render web service with `backend/` as the root.
- Set the environment variables from `.env.example`.
- Use `npm install` and `npm start`.

### Frontend (Vercel / Netlify)

- Deploy the `frontend/` folder as a static site.
- Update `API_BASE_URL` in `frontend/app.js` to the backend URL from Render.

## Notes

- User authentication uses JWT tokens.
- Backend stores user accounts in MongoDB.
- API key generation is handled with a secure random key.
- The dashboard page fetches user profile and usage history.
- The protected endpoint charges 1 credit per call and tracks usage.
