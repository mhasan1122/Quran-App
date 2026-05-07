import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { config } from './config.js';
import { connectMongo, closeMongo } from './db/client.js';
import { surahRoutes } from './routes/surahs.js';
import { searchRoutes } from './routes/search.js';
import { audioRoutes } from './routes/audio.js';

const app = new Hono();

app.use('*', logger());
app.use(
  '*',
  cors({
    origin: (origin) => {
      if (!origin) return '';
      if (config.corsOrigin === '*') return origin;
      const allowed = config.corsOrigin.split(',').map((s) => s.trim());
      return allowed.includes(origin) ? origin : '';
    },
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.get('/', (c) =>
  c.json({
    name: 'Quran Mazid API',
    version: '0.1.0',
    endpoints: {
      health: '/health',
      surahs: '/api/surahs',
      surah: '/api/surahs/:number',
      search: '/api/search?q=...&limit=30',
      audioReciters: '/api/audio/reciters',
      audioSurah: '/api/audio/surah/:number?reciter=ar.alafasy',
      audioAyah: '/api/audio/ayah/:surah/:ayah?reciter=ar.alafasy',
    },
  }),
);

app.get('/health', async (c) => {
  try {
    const db = await connectMongo();
    await db.command({ ping: 1 });
    return c.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    return c.json({ status: 'error', error: (err as Error).message }, 503);
  }
});

app.route('/api/surahs', surahRoutes);
app.route('/api/search', searchRoutes);
app.route('/api/audio', audioRoutes);

app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal server error', message: err.message }, 500);
});

app.notFound((c) => c.json({ error: 'Not found' }, 404));

async function main() {
  await connectMongo();
  console.log(`[mongo] connected to db "${config.mongoDb}"`);

  serve({ fetch: app.fetch, port: config.port }, (info) => {
    console.log(`[hono] listening on http://localhost:${info.port}`);
  });
}

main().catch((err) => {
  console.error('fatal:', err);
  process.exit(1);
});

const shutdown = async (signal: string) => {
  console.log(`\n[server] received ${signal}, shutting down...`);
  await closeMongo();
  process.exit(0);
};
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
