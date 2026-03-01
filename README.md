# CalcMind - Premium AI-Powered Calculator

CalcMind is a full-stack MERN application with a premium dark-mode UI, secure Auth0 authentication, and AI-powered calculation explanations.

## Tech Stack
- **Frontend:** React, TypeScript, Vite
- **Backend:** Node.js, Express, TypeScript
- **Database:** MongoDB
- **Authentication:** Auth0
- **AI Integration:** OpenAI (`@ai-sdk/openai`)

## Core Features

1. **Premium User Interface**
   - High-end dark mode design with vibrant gradient orbs and glassmorphism paneling.
   - Smooth CSS animations and responsive layout.
   - Custom minimal logo design integrated.
2. **Secure Authentication (Auth0)**
   - Sign in/up flows using Auth0 Universal Login.
   - JWT validation on all secure backend API routes (`express-oauth2-jwt-bearer`).
3. **Safe Calculation Engine**
   - No unsafe `eval()` used.
   - Custom Tokenizer and Shunting-yard (RPN conversion) implementation.
   - Deterministic evaluator with step-by-step logging.
4. **Per-User History Tracking**
   - Saves calculation history securely to MongoDB.
   - Associates calculations with Auth0 `userId` to ensure data privacy.
   - Fallback in-memory history when MongoDB is disabled.
5. **AI Explanation Endpoint**
   - AI breaks down the user's mathematical expression step-by-step.
   - Explanations are hidden until the user is securely authenticated.

## Project Structure

- `client/` - React frontend application.
- `server/` - Express backend API.

## Local Development

### 1) Backend API setup
```bash
cd server
cp .env.example .env
npm install
npm run dev
```

*Required Environment Variables (`server/.env`):*
```env
PORT=4001
MONGO_URI=mongodb_connection_string
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4o-mini
CLIENT_ORIGIN=http://localhost:5173

# Auth0 Configuration
AUTH0_AUDIENCE=your_auth0_management_api_identifier
AUTH0_ISSUER_BASE_URL=https://your_auth0_domain/
```

### 2) Frontend Client setup
```bash
cd client
cp .env.example .env
npm install
npm run dev
```

*Required Environment Variables (`client/.env`):*
```env
VITE_API_BASE_URL=http://localhost:4001/api/v1

# Auth0 Configuration
VITE_AUTH0_DOMAIN=your_auth0_domain
VITE_AUTH0_CLIENT_ID=your_auth0_client_id
VITE_AUTH0_AUDIENCE=your_auth0_management_api_identifier
```

## API Summary

- `GET /health` - Health check and configuration status.
- `POST /api/v1/calculate` (Secured) - Evaluates expression and saves history.
- `POST /api/v1/ai/explain` (Secured) - Generates AI explanation.
- `GET /api/v1/history` (Secured) - Retrieves computation history for the authenticated user.
