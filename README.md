# AI Powered Code Assistant

A full-stack AI coding assistant with a React + TypeScript frontend and a Node.js + Express backend powered by Google's Gemini API.

## Features

- Generate code from natural language prompts
- Review code for bugs, security, performance, and style issues
- Explain code at beginner, intermediate, and expert depth
- Generate documentation comments
- Generate unit tests
- Translate code between multiple languages
- Suggest refactorings with before/after improvements
- Save authenticated user activity history

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, Zustand, Monaco Editor
- Backend: Node.js, Express, Zod, SQL.js
- AI: Google Gemini

## Project Structure

```text
ai-powered-code-assistant/
|-- backend/
|   |-- src/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- prompts/
|   |   |-- models/
|   |   |-- middleware/
|   |   `-- config/
|   |-- .env.example
|   |-- package.json
|   `-- data/
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- pages/
|   |   |-- lib/
|   |   |-- store/
|   |   `-- types/
|   `-- package.json
`-- README.md
```

## Environment Variables

Create `backend/.env` from `backend/.env.example`.

Required backend variables:

```env
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=change_this_to_a_long_random_string_in_production
PORT=5000
NODE_ENV=development
```

Note: the frontend Vite dev server proxies `/api` requests to `http://localhost:5000`.

## Local Setup

### 1. Install dependencies

```powershell
cd backend
npm install

cd ..\frontend
npm install
```

### 2. Start the backend

```powershell
cd backend
npm run dev
```

### 3. Start the frontend

```powershell
cd frontend
npm run dev
```

## Default URLs

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

## Notes

- `backend/.env` is ignored and should never be committed.
- Local database files in `backend/data/` are ignored.
- Built frontend assets and `node_modules` are ignored.
