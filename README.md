# PLCP Competitive Intelligence Repository

Internal full-stack MVP for Physician Life Care Planning to track competitors, intelligence items, AI summaries, SWOT analyses, and natural language search.

## Stack

- React + Vite
- Tailwind CSS
- Node.js + Express
- Supabase/PostgreSQL
- OpenAI API

The app works in demo mode without Supabase or OpenAI keys by using seeded in-memory data and deterministic mock AI outputs. Add environment variables to persist data and call OpenAI.

## Setup

1. Install dependencies:

```bash
npm run install:all
npm install
```

2. Copy environment variables:

```bash
copy .env.example server\.env
```

3. Optional Supabase setup:

- Create a Supabase project.
- Run `supabase/schema.sql` in the SQL editor.
- Run `supabase/seed.sql` for demo data.
- Add `SUPABASE_URL` and either `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_PUBLISHABLE_KEY` to `server/.env`.
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to `client/.env` if direct frontend Supabase queries are needed.

Current configured project:

```env
SUPABASE_URL=https://vaoojkqtmvykxqdnuslo.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_UmcU9WgSM_NHv9xfa75low_7SYSb7A1
VITE_SUPABASE_URL=https://vaoojkqtmvykxqdnuslo.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_UmcU9WgSM_NHv9xfa75low_7SYSb7A1
```

If `/api/health` reports `storage: "supabase"` but `/api/dashboard` says `public.competitors` is missing, run the schema and seed SQL files above in Supabase before using the app.

4. Optional OpenAI setup:

- Add `OPENAI_API_KEY` to `server/.env`.

5. Start the app:

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:4000`

## Demo Script

1. Open the dashboard and point out the search bar, KPI cards, recent competitors, and activity.
2. Navigate to Competitors and open a profile to show structured positioning, tags, related intelligence, summaries, and SWOT.
3. Add a new competitor with tags and strategic notes.
4. Add an intelligence item using either a URL or manual content.
5. Generate an AI summary and explain how the OpenAI service is isolated for future prompt/model updates.
6. Generate a SWOT from profile data plus related intelligence.
7. Use Search with a natural language query like `telehealth risk opportunities` and filter the repository by tags/categories.

## API Routes

- `GET /api/competitors`
- `POST /api/competitors`
- `GET /api/competitors/:id`
- `PUT /api/competitors/:id`
- `DELETE /api/competitors/:id`
- `GET /api/intelligence`
- `POST /api/intelligence`
- `GET /api/intelligence/:id`
- `POST /api/intelligence/:id/summarize`
- `POST /api/competitors/:id/swot`
- `GET /api/search?q=`
- `GET /api/dashboard`
- `GET /api/insights`
- `GET /api/positioning`
- `PUT /api/positioning/profile`
- `POST /api/positioning/analyze`

## Project Structure

```text
client/                 React app
server/                 Express API
server/src/services/    AI, search, ingestion, and repository services
supabase/               Database schema and seed data
```

## Positioning Analysis

The Positioning page lets admins define PLCP services, differentiators, pricing position, operational strengths, weaknesses, target customers, and strategic goals. The app uses OpenAI through the backend to generate PLCP-vs-market analysis, market gaps, missed competitor opportunities, and strategic recommendations. The comparison dashboard also builds a PLCP vs competitor feature matrix with `advantage`, `parity`, `weakness`, and `opportunity` indicators.
