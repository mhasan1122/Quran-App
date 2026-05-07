## Quran Mazid  (Frontend)

Next.js (App Router) frontend for a Quran reading experience.

### Features

- Surah sidebar with all 114 surahs (desktop) and a collapsible drawer on mobile
- Ayah reader with Arabic RTL rendering and English translation
- Per-ayah audio playback controls
- Search modal to find ayahs by English translation text
- Display settings: Arabic font family, Arabic font size, translation font size (persisted via localStorage)

### Tech

- Next.js + React (TypeScript)
- Tailwind CSS (via PostCSS) plus project-level CSS variables in `app/globals.css`

### Environment variables

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

If not set, the app defaults to `http://localhost:4000`.

### Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

### Key files

- `app/page.tsx`: Main reader shell and responsive layout
- `app/components/SurahSidebar.tsx`: Surah list and filtering
- `app/components/AyahReader.tsx`: Surah header, ayah rendering, and playback UI
- `app/components/SearchPanel.tsx`: Search UI (modal)
- `app/components/SettingsPanel.tsx` and `app/context/SettingsContext.tsx`: Display settings and persistence
