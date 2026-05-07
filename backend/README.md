## Quran Mazid (Backend API)

Hono + TypeScript API that serves Quran data and provides free recitation audio URLs for the Next.js frontend in `../frontend`.

### Tech

- Node.js + Hono (TypeScript)
- MongoDB as the data store

### Setup

Install dependencies:

```bash
npm install
```

Create a `.env` file (or copy the example):

```bash
cp .env.example .env
```

Expected environment variables:

```bash
MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER/?appName=QuranDatabase
MONGODB_DB=QuranDatabase
PORT=4000
CORS_ORIGIN=http://localhost:3000
```

### Run

```bash
npm run dev
```

The server listens on `http://localhost:4000` by default.

### API endpoints

- `GET /health`: Ping MongoDB
- `GET /api/surahs`: List all 114 surahs (metadata only)
- `GET /api/surahs/:num`: Surah details including ayahs and per-ayah audio URLs (optional `?reciter=...`)
- `GET /api/search?q=...&limit=30`: Search across English translations (case-insensitive)
- `GET /api/audio/reciters`: List supported reciters and the default
- `GET /api/audio/surah/:num?reciter=...`: Full-surah MP3 URL
- `GET /api/audio/ayah/:surah/:ayah?reciter=...`: Single-ayah MP3 URL

### Database schema (required)

The API expects a MongoDB collection named `surahs` with documents shaped like:

```ts
{
  number: 1,
  arabicName: 'الفاتحة',
  englishName: 'الفاتحة',
  transliteration: 'Al-Fatihah',
  totalAyahs: 7,
  revelationType: 'Meccan',
  ayahs: [{ number, arabic, translation }]
}
```

The API normalizes the response for the frontend and adds `englishNameTranslation` from a static metadata table.

### Audio source

Audio URLs are generated using free public CDNs:

- Per-ayah: `https://cdn.islamic.network/quran/audio/128/{reciter}/{globalAyah}.mp3`
- Per-surah: `https://cdn.islamic.network/quran/audio-surah/128/{reciter}/{surah}.mp3`

`globalAyah` is the 1..6236 sequential ayah index derived from standard surah ayah counts.

### Utilities

```bash
npm run inspect
```

Prints DB collections and a sample document to help validate the schema.
