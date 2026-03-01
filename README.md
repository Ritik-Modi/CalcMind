# CalcMind (Project 1) - MERN + TypeScript + AI SDK

Project 1 is now upgraded to the target stack standard you requested:
- MongoDB
- Express (TypeScript)
- React (TypeScript + Vite)
- Node.js

It also includes an AI explanation endpoint using AI SDK.

## Structure

- `client/` React + TypeScript app
- `server/` Express + TypeScript API
- legacy files (`index.html`, `main.js`, `style.css`, `server.js`) are kept for reference only

## Implemented Features

1. Safe calculation engine (no `eval`)
   - Tokenizer
   - Shunting-yard (RPN conversion)
   - Deterministic evaluator with step logs
2. AI explain endpoint
   - `POST /api/v1/ai/explain`
   - Uses `ai` + `@ai-sdk/openai`
   - Fallback explanation when key is missing
3. History endpoint
   - `GET /api/v1/history`
   - Uses MongoDB if connected, otherwise in-memory fallback
4. Backend calculation endpoint
   - `POST /api/v1/calculate`

## Run

### 1) Server
```bash
cd server
cp .env.example .env
npm install
npm run dev
```

### 2) Client
```bash
cd client
npm install
npm run dev
```

Client default: `http://localhost:5173`  
Server default: `http://localhost:4001`

## Server Env

`server/.env.example`

```env
PORT=4001
MONGO_URI=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
CLIENT_ORIGIN=http://localhost:5173
```

## API Summary

- `GET /health`
- `POST /api/v1/calculate`
  - body: `{ "expression": "12/(2+1)" }`
- `POST /api/v1/ai/explain`
  - body: `{ "expression": "12/(2+1)", "result": 4, "steps": ["2 + 1 = 3", "12 / 3 = 4"] }`
- `GET /api/v1/history`

## Portfolio Story

Before: basic calculator with unsafe `eval`.  
After: production-style MERN + TS architecture with backend computation, AI explainability, and persistence-ready history.
