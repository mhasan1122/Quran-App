import 'dotenv/config';

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export const config = {
  mongoUri: required('MONGODB_URI'),
  mongoDb: process.env.MONGODB_DB || 'quran',
  port: Number(process.env.PORT || 4000),
  // Treat empty-string env var as "unset" (common in some hosts dashboards).
  corsOrigin: (process.env.CORS_ORIGIN && process.env.CORS_ORIGIN.trim().length > 0)
    ? process.env.CORS_ORIGIN
    : '*',
} as const;
