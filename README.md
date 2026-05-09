## Quran Web Application

This repository contains a Quran reader web app with a Next.js frontend and a Hono (Node.js) backend API. The UI is styled to match the general look and interaction patterns of QuranMazid’s reader experience.

### Hosted links

- **Website (Frontend)**: `https://quran-app-9t45.vercel.app/`
- **Backend API (Base URL)**: `https://quran-app-50vf.onrender.com`
  - Example: `https://quran-app-50vf.onrender.com/api/surahs`

### What’s inside

- **`frontend/`**: Next.js (TypeScript) app providing the reader UI (surah list, ayah reader, search modal, display settings).
- **`backend/`**: Hono (TypeScript) API that serves surah/ayah data from MongoDB and provides free recitation audio URLs.

### Requirements

- Node.js 18+ (recommended)
- npm (or pnpm/yarn)
- A MongoDB database pre-seeded with the expected `surahs` collection shape (see `backend/README.md`)

### Quick start

Run the backend first:

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Then run the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

### Notes

- The frontend expects the API at `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:4000`).
- Audio is served via free public CDNs (configured by the backend).

