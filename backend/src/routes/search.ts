import { Hono } from 'hono';
import { searchAyahs } from '../db/surahs.js';
import { surahMeta } from '../data/surahMeta.js';

export const searchRoutes = new Hono();

searchRoutes.get('/', async (c) => {
  const q = (c.req.query('q') || '').trim();
  const limit = Math.min(Math.max(Number(c.req.query('limit') || 30), 1), 100);

  if (!q) return c.json({ total: 0, results: [] });
  if (q.length < 2) {
    return c.json({ total: 0, results: [], error: 'Query must be at least 2 characters' }, 400);
  }

  const hits = await searchAyahs(q, limit);
  const results = hits.map((h) => ({
    surahNumber: h.surahNumber,
    surahName: h.surahTransliteration,
    surahArabicName: h.surahName,
    surahMeaning: surahMeta[h.surahNumber]?.englishNameTranslation ?? '',
    numberInSurah: h.numberInSurah,
    text: h.translation,
    arabic: h.arabic,
  }));

  return c.json({ total: results.length, query: q, results });
});
