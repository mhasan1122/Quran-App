import type { Surah } from './surahs';

export type RevelationType = Surah['revelationType'];

/** Accept API string or local Surah type (alquran.cloud uses Meccan / Medinan). */
export function revelationImagePath(revelationType: RevelationType | string): string {
  // Assets in `public/`
  return revelationType === 'Medinan' ? '/image%20copy.png' : '/image.png';
}

export function revelationShortLabel(revelationType: RevelationType | string): string {
  return revelationType === 'Medinan' ? 'Madinah' : 'Makkah';
}
