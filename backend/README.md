# Quran Mazid Backend

Hono + TypeScript API that serves Quran data from MongoDB Atlas and free recitation audio URLs (islamic.network CDN). Powers the `frontend/` Next.js app.

## Run

```bash
npm install
npm run dev      # tsx watch on http://localhost:4000
npm run build    # tsc -> dist/
npm start        # node dist/index.js
```

Environment variables (`.env`):

```
MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER/?appName=QuranDatabase
MONGODB_DB=quran
PORT=4000
CORS_ORIGIN=http://localhost:3000
```

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET | `/health` | Pings MongoDB. |
| GET | `/api/surahs` | Lists all 114 surahs (metadata only). |
| GET | `/api/surahs/:num` | Returns a surah with all its ayahs and per-ayah audio URLs. Optional `?reciter=`. |
| GET | `/api/search?q=...&limit=30` | Full-text search across English translations (case-insensitive). |
| GET | `/api/audio/reciters` | Lists available reciters and the default. |
| GET | `/api/audio/surah/:num?reciter=` | Audio URL for a full surah. |
| GET | `/api/audio/ayah/:surah/:ayah?reciter=` | Audio URL for a single ayah. |

## Data shape

The MongoDB `surahs` collection (already seeded) uses:

```ts
{
  number: 1,
  arabicName: 'الفاتحة',
  englishName: 'الفاتحة',     // (DB stores arabic here)
  transliteration: 'Al-Fatihah',
  totalAyahs: 7,
  revelationType: 'Meccan',
  ayahs: [{ number, arabic, translation }]
}
```

The API normalises this for the frontend so `englishName` is always the transliteration (e.g. `Al-Fatihah`) and adds `englishNameTranslation` (e.g. `The Opening`) from a static metadata table.

## Audio source

We use the free [islamic.network CDN](https://alquran.cloud/cdn):

- per-ayah: `https://cdn.islamic.network/quran/audio/128/{reciter}/{globalAyah}.mp3`
- per-surah: `https://cdn.islamic.network/quran/audio-surah/128/{reciter}/{surah}.mp3`

`globalAyah` is the 1..6236 sequential ayah number, computed from the standard surah ayah counts.

## Scripts

- `npm run inspect` - prints DB collections and a sample document. Useful for re-checking the schema.
