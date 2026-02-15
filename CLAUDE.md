# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Reading Partner is a full-stack reading comprehension app. Users upload PDFs or images, highlight text, take notes, and generate AI-powered comprehension questions. The app uses Firebase for auth/storage and Claude API for question generation.

## Architecture

**Monorepo with two independent packages:**
- `frontend/` — React 19 SPA (Vite + Rolldown)
- `backend/` — Express 5 API server

**Frontend three-panel layout** (defined in App.jsx):
- Sidebar: document list and navigation
- Main content: PDF/image viewer with canvas + text layer overlay
- Right panel: tabbed interface for highlights, notes, and questions

**State management:** React Context API (AuthContext, ReadingContext) with custom hooks (useAuth, useReading, useTheme). No external state library.

**Document rendering:** PDF.js renders to canvas with an absolutely-positioned text layer for selection. Images use Tesseract.js OCR for text extraction.

**Data flow:** Optimistic UI updates with Firestore sync and rollback on error. Firestore structure: `users/{userId}/pdfs/{pdfId}/highlights|notes`.

**Backend middleware chain:** Helmet → CORS → rate limiting (100 req/15min general, 20 req/hr AI) → Firebase auth token verification → validation/sanitization → route handlers.

## Development Commands

```bash
# Frontend (from frontend/)
npm run dev        # Dev server on port 3000
npm run build      # Production build
npm run lint       # ESLint
npm run preview    # Preview production build

# Backend (from backend/)
npm run dev        # Nodemon on port 3001
npm start          # Production server
```

Both frontend and backend require `.env` files — see `.env.example` in each directory. Frontend env vars are prefixed with `VITE_`. Backend needs Firebase Admin credentials and an Anthropic API key.

## Key Technical Details

- Frontend uses Vite with the Rolldown bundler (not Webpack/esbuild)
- Backend uses Express 5 (not Express 4 — different error handling patterns)
- Firebase Admin SDK on backend, Firebase Client SDK on frontend — separate initialization
- AI question generation (`backend/src/services/anthropic.js`) uses structured JSON output with fallback to default questions on parse failure
- CSS theming uses `data-theme` attribute on document element with CSS variables
- No test framework is currently configured
