import { Hono } from 'hono';
import {
  ayahAudioUrl,
  surahAudioUrl,
  RECITERS,
  DEFAULT_RECITER,
  isValidReciter,
} from '../audio.js';

export const audioRoutes = new Hono();

audioRoutes.get('/reciters', (c) => {
  return c.json({ default: DEFAULT_RECITER, reciters: RECITERS });
});

audioRoutes.get('/surah/:num{[0-9]+}', (c) => {
  const num = Number(c.req.param('num'));
  const reciterParam = c.req.query('reciter');
  const reciter = reciterParam && isValidReciter(reciterParam) ? reciterParam : DEFAULT_RECITER;
  const url = surahAudioUrl(num, reciter);
  if (!url) return c.json({ error: 'Invalid surah number' }, 400);
  return c.json({ surahNumber: num, reciter, url });
});

audioRoutes.get('/ayah/:surah{[0-9]+}/:ayah{[0-9]+}', (c) => {
  const surah = Number(c.req.param('surah'));
  const ayah = Number(c.req.param('ayah'));
  const reciterParam = c.req.query('reciter');
  const reciter = reciterParam && isValidReciter(reciterParam) ? reciterParam : DEFAULT_RECITER;
  const url = ayahAudioUrl(surah, ayah, reciter);
  if (!url) return c.json({ error: 'Invalid surah/ayah combination' }, 400);
  return c.json({ surahNumber: surah, ayahNumber: ayah, reciter, url });
});
