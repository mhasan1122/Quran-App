import { Hono } from 'hono';
import { listAllSurahs, getSurahByNumber } from '../db/surahs.js';
import { surahMeta } from '../data/surahMeta.js';
import { ayahAudioUrl, surahAudioUrl, DEFAULT_RECITER, isValidReciter } from '../audio.js';

export const surahRoutes = new Hono();

surahRoutes.get('/', async (c) => {
  const surahs = await listAllSurahs();
  const out = surahs.map((s) => ({
    number: s.number,
    name: s.arabicName,
    englishName: s.transliteration,
    englishNameTranslation: surahMeta[s.number]?.englishNameTranslation ?? '',
    numberOfAyahs: s.totalAyahs,
    revelationType: s.revelationType,
  }));
  return c.json(out);
});

surahRoutes.get('/:num{[0-9]+}', async (c) => {
  const num = Number(c.req.param('num'));
  if (!Number.isInteger(num) || num < 1 || num > 114) {
    return c.json({ error: 'Invalid surah number. Must be 1..114.' }, 400);
  }
  const reciterParam = c.req.query('reciter');
  const reciter = reciterParam && isValidReciter(reciterParam) ? reciterParam : DEFAULT_RECITER;

  const doc = await getSurahByNumber(num);
  if (!doc) return c.json({ error: 'Surah not found' }, 404);

  const ayahs = doc.ayahs
    .slice()
    .sort((a, b) => a.number - b.number)
    .map((a) => ({
      numberInSurah: a.number,
      text: a.arabic,
      translation: a.translation,
      audio: ayahAudioUrl(num, a.number, reciter),
    }));

  return c.json({
    number: doc.number,
    name: doc.arabicName,
    englishName: doc.transliteration,
    englishNameTranslation: surahMeta[doc.number]?.englishNameTranslation ?? '',
    numberOfAyahs: doc.totalAyahs,
    revelationType: doc.revelationType,
    audio: surahAudioUrl(num, reciter),
    reciter,
    ayahs,
  });
});
